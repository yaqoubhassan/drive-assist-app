<?php

namespace App\Http\Middleware;

use App\Models\DeviceFingerprint;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackGuestDevice
{
    /**
     * Handle an incoming request.
     * This middleware tracks guest devices for diagnosis limit enforcement.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Get device ID from header
        $deviceId = $request->header('X-Device-ID');

        if (!$deviceId && !$request->user()) {
            return response()->json([
                'success' => false,
                'message' => 'Device identification required. Please provide X-Device-ID header.',
            ], 400);
        }

        // If device ID provided, find or create fingerprint
        if ($deviceId) {
            $fingerprint = DeviceFingerprint::firstOrCreate(
                ['device_id' => $deviceId],
                [
                    'device_type' => $request->header('X-Device-Type'),
                    'device_model' => $request->header('X-Device-Model'),
                    'os_version' => $request->header('X-OS-Version'),
                    'app_version' => $request->header('X-App-Version'),
                    'ip_address' => $request->ip(),
                    'user_id' => $request->user()?->id,
                ]
            );

            // Update last seen info
            $fingerprint->update([
                'ip_address' => $request->ip(),
                'app_version' => $request->header('X-App-Version') ?? $fingerprint->app_version,
            ]);

            // Link to user if authenticated but not already linked
            if ($request->user() && !$fingerprint->user_id) {
                $fingerprint->update(['user_id' => $request->user()->id]);
            }

            // Add fingerprint to request for use in controllers
            $request->merge(['device_fingerprint' => $fingerprint]);
        }

        return $next($request);
    }
}
