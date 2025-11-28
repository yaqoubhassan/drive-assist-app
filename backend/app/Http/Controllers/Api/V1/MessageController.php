<?php

namespace App\Http\Controllers\Api\V1;

use App\Events\MessageReadEvent;
use App\Events\NewMessageEvent;
use App\Events\UserTypingEvent;
use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class MessageController extends Controller
{
    /**
     * Get all conversations for the authenticated user.
     */
    public function conversations(Request $request): JsonResponse
    {
        $user = $request->user();

        $conversations = Conversation::forUser($user->id)
            ->with(['driver:id,first_name,last_name,avatar', 'expert:id,first_name,last_name,avatar', 'latestMessage'])
            ->orderBy('last_message_at', 'desc')
            ->paginate(20);

        // Add unread count for each conversation
        $conversations->getCollection()->transform(function ($conversation) use ($user) {
            $conversation->unread_count = $conversation->unreadCountFor($user->id);
            $conversation->other_participant = $conversation->getOtherParticipant($user->id);
            return $conversation;
        });

        return response()->json([
            'success' => true,
            'data' => $conversations,
        ]);
    }

    /**
     * Get or create a conversation with another user.
     */
    public function getOrCreateConversation(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'lead_id' => 'nullable|exists:leads,id',
        ]);

        $user = $request->user();
        $otherUser = User::findOrFail($request->user_id);

        // Determine driver and expert based on roles
        if ($user->role === 'driver' && $otherUser->role === 'expert') {
            $driverId = $user->id;
            $expertId = $otherUser->id;
        } elseif ($user->role === 'expert' && $otherUser->role === 'driver') {
            $driverId = $otherUser->id;
            $expertId = $user->id;
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Conversations can only be between drivers and experts',
            ], 400);
        }

        $conversation = Conversation::findOrCreateBetween($driverId, $expertId, $request->lead_id);

        $conversation->load(['driver:id,first_name,last_name,avatar', 'expert:id,first_name,last_name,avatar']);
        $conversation->unread_count = $conversation->unreadCountFor($user->id);
        $conversation->other_participant = $conversation->getOtherParticipant($user->id);

        return response()->json([
            'success' => true,
            'data' => $conversation,
        ]);
    }

    /**
     * Get messages in a conversation.
     */
    public function messages(Request $request, int $conversationId): JsonResponse
    {
        $user = $request->user();
        $conversation = Conversation::findOrFail($conversationId);

        // Check if user is a participant
        if (!$conversation->hasParticipant($user->id)) {
            return response()->json([
                'success' => false,
                'message' => 'You are not a participant in this conversation',
            ], 403);
        }

        $messages = $conversation->messages()
            ->with('sender:id,first_name,last_name,avatar')
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json([
            'success' => true,
            'data' => $messages,
        ]);
    }

    /**
     * Send a message.
     */
    public function sendMessage(Request $request, int $conversationId): JsonResponse
    {
        $request->validate([
            'content' => 'required_without:media|string|max:5000',
            'type' => ['nullable', Rule::in(['text', 'image', 'voice', 'location'])],
            'media' => 'nullable|file|max:10240', // 10MB max
            'latitude' => 'required_if:type,location|numeric|between:-90,90',
            'longitude' => 'required_if:type,location|numeric|between:-180,180',
            'address' => 'nullable|string|max:500',
        ]);

        $user = $request->user();
        $conversation = Conversation::findOrFail($conversationId);

        // Check if user is a participant
        if (!$conversation->hasParticipant($user->id)) {
            return response()->json([
                'success' => false,
                'message' => 'You are not a participant in this conversation',
            ], 403);
        }

        $type = $request->type ?? 'text';
        $content = $request->content ?? '';
        $metadata = null;

        // Handle media uploads
        if ($request->hasFile('media') && in_array($type, ['image', 'voice'])) {
            $file = $request->file('media');
            $path = $file->store('messages/' . $conversationId, 'public');
            $url = Storage::disk('public')->url($path);

            $metadata = [
                'url' => $url,
                'filename' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
            ];

            if (empty($content)) {
                $content = $type === 'image' ? '[Image]' : '[Voice message]';
            }
        }

        // Handle location
        if ($type === 'location') {
            $metadata = [
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'address' => $request->address,
            ];

            if (empty($content)) {
                $content = '[Location shared]';
            }
        }

        $message = Message::create([
            'conversation_id' => $conversationId,
            'sender_id' => $user->id,
            'content' => $content,
            'type' => $type,
            'metadata' => $metadata,
        ]);

        $message->load('sender:id,first_name,last_name,avatar');

        // Broadcast the new message
        broadcast(new NewMessageEvent($message))->toOthers();

        return response()->json([
            'success' => true,
            'message' => 'Message sent successfully',
            'data' => $message,
        ], 201);
    }

    /**
     * Mark messages as read.
     */
    public function markAsRead(Request $request, int $conversationId): JsonResponse
    {
        $user = $request->user();
        $conversation = Conversation::findOrFail($conversationId);

        // Check if user is a participant
        if (!$conversation->hasParticipant($user->id)) {
            return response()->json([
                'success' => false,
                'message' => 'You are not a participant in this conversation',
            ], 403);
        }

        // Get unread message IDs before marking as read
        $messageIds = $conversation->messages()
            ->notSentBy($user->id)
            ->unread()
            ->pluck('id')
            ->toArray();

        if (count($messageIds) > 0) {
            $conversation->markAsReadFor($user->id);

            // Broadcast read receipts
            broadcast(new MessageReadEvent($conversationId, $user->id, $messageIds))->toOthers();
        }

        return response()->json([
            'success' => true,
            'message' => 'Messages marked as read',
            'data' => [
                'read_count' => count($messageIds),
            ],
        ]);
    }

    /**
     * Broadcast typing indicator.
     */
    public function typing(Request $request, int $conversationId): JsonResponse
    {
        $request->validate([
            'is_typing' => 'required|boolean',
        ]);

        $user = $request->user();
        $conversation = Conversation::findOrFail($conversationId);

        // Check if user is a participant
        if (!$conversation->hasParticipant($user->id)) {
            return response()->json([
                'success' => false,
                'message' => 'You are not a participant in this conversation',
            ], 403);
        }

        broadcast(new UserTypingEvent(
            $conversationId,
            $user->id,
            $user->first_name,
            $request->is_typing
        ))->toOthers();

        return response()->json([
            'success' => true,
        ]);
    }

    /**
     * Get total unread count for the user.
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $user = $request->user();

        $unreadCount = Message::whereHas('conversation', function ($query) use ($user) {
            $query->forUser($user->id);
        })
            ->notSentBy($user->id)
            ->unread()
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'unread_count' => $unreadCount,
            ],
        ]);
    }

    /**
     * Delete a message (soft delete).
     */
    public function deleteMessage(Request $request, int $messageId): JsonResponse
    {
        $user = $request->user();
        $message = Message::findOrFail($messageId);

        // Only the sender can delete their message
        if (!$message->isSentBy($user->id)) {
            return response()->json([
                'success' => false,
                'message' => 'You can only delete your own messages',
            ], 403);
        }

        $message->delete();

        return response()->json([
            'success' => true,
            'message' => 'Message deleted successfully',
        ]);
    }
}
