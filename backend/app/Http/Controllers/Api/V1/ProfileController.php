<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Http\Resources\UserPreferenceResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return $this->success(new UserResource($request->user()->load([
            'driverProfile', 'expertProfile', 'preferences', 'vehicles'
        ])));
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|nullable|string|max:20|unique:users,phone,' . $request->user()->id,
        ]);

        $request->user()->update($validated);

        return $this->success(new UserResource($request->user()->fresh()), 'Profile updated');
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => 'required|current_password',
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $request->user()->update(['password' => Hash::make($validated['password'])]);

        return $this->success(null, 'Password updated successfully');
    }

    public function updateAvatar(Request $request): JsonResponse
    {
        $request->validate(['avatar' => 'required|image|mimes:jpeg,png,jpg|max:2048']);

        $user = $request->user();
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar' => $path]);

        return $this->success(['avatar' => Storage::disk('public')->url($path)], 'Avatar updated');
    }

    public function deleteAvatar(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
            $user->update(['avatar' => null]);
        }

        return $this->success(null, 'Avatar deleted');
    }

    public function preferences(Request $request): JsonResponse
    {
        $preferences = $request->user()->preferences;
        return $this->success(new UserPreferenceResource($preferences));
    }

    public function updatePreferences(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'language' => 'sometimes|string|in:en,fr',
            'region' => 'sometimes|string|max:5',
            'currency' => 'sometimes|string|max:5',
            'distance_unit' => 'sometimes|string|in:km,miles',
            'push_notifications' => 'sometimes|boolean',
            'email_notifications' => 'sometimes|boolean',
            'sms_notifications' => 'sometimes|boolean',
            'maintenance_reminders' => 'sometimes|boolean',
            'marketing_emails' => 'sometimes|boolean',
            'theme' => 'sometimes|string|in:light,dark,system',
        ]);

        $request->user()->preferences->update($validated);

        return $this->success(
            new UserPreferenceResource($request->user()->preferences->fresh()),
            'Preferences updated'
        );
    }
}
