<?php

use App\Models\Conversation;
use App\Models\Diagnosis;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

/**
 * User's private channel for notifications.
 * Users can only subscribe to their own notification channel.
 */
Broadcast::channel('user.{userId}', function (User $user, int $userId) {
    return $user->id === $userId;
});

/**
 * Conversation channel for real-time messaging.
 * Only participants of the conversation can subscribe.
 */
Broadcast::channel('conversation.{conversationId}', function (User $user, int $conversationId) {
    $conversation = Conversation::find($conversationId);

    if (!$conversation) {
        return false;
    }

    return $conversation->hasParticipant($user->id);
});

/**
 * Expert channel for lead notifications.
 * Only the expert can subscribe to their own lead notifications.
 */
Broadcast::channel('expert.{expertId}', function (User $user, int $expertId) {
    return $user->id === $expertId && $user->role === 'expert';
});

/**
 * Diagnosis channel for real-time updates.
 * Only the diagnosis owner or related expert can subscribe.
 */
Broadcast::channel('diagnosis.{diagnosisId}', function (User $user, int $diagnosisId) {
    $diagnosis = Diagnosis::find($diagnosisId);

    if (!$diagnosis) {
        return false;
    }

    // User owns the diagnosis
    if ($diagnosis->user_id === $user->id) {
        return true;
    }

    // Expert has a lead for this diagnosis
    if ($user->role === 'expert') {
        return Lead::where('diagnosis_id', $diagnosisId)
            ->where('expert_id', $user->id)
            ->exists();
    }

    return false;
});

/**
 * Lead channel for status updates.
 * Both the expert and driver associated with the lead can subscribe.
 */
Broadcast::channel('lead.{leadId}', function (User $user, int $leadId) {
    $lead = Lead::find($leadId);

    if (!$lead) {
        return false;
    }

    return $lead->expert_id === $user->id || $lead->driver_id === $user->id;
});

/**
 * Presence channel for online status.
 * Authenticated users can join the presence channel.
 */
Broadcast::channel('presence.online', function (User $user) {
    return [
        'id' => $user->id,
        'name' => $user->first_name . ' ' . $user->last_name,
        'role' => $user->role,
    ];
});
