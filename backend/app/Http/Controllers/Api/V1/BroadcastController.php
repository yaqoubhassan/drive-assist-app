<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;

class BroadcastController extends Controller
{
    /**
     * Authenticate the user for Reverb broadcasting.
     * This endpoint is called by pusher-js/Laravel Echo to authenticate private channels.
     */
    public function authenticate(Request $request): JsonResponse
    {
        // Get the user from the request (authenticated via Sanctum)
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Parse the channel name from socket_id and channel_name
        $channelName = $request->channel_name;
        $socketId = $request->socket_id;

        // Use Laravel's broadcast authorization
        $response = Broadcast::auth($request);

        return response()->json($response);
    }
}
