<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OnboardingController extends Controller
{
    public function driverStatus(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user->driverProfile;

        return $this->success([
            'onboarding_completed' => $user->onboarding_completed,
            'has_vehicle' => $user->vehicles()->exists(),
            'profile_complete' => $profile && $profile->region_id,
        ]);
    }

    public function completeDriverOnboarding(Request $request): JsonResponse
    {
        $user = $request->user();

        // Validate basic requirements
        if (!$user->vehicles()->exists()) {
            return $this->error('Please add at least one vehicle to complete onboarding.', 422);
        }

        $user->update(['onboarding_completed' => true]);

        return $this->success(null, 'Onboarding completed');
    }

    public function expertStatus(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user->expertProfile;

        return $this->success([
            'onboarding_completed' => $user->onboarding_completed,
            'profile_complete' => $profile && $profile->business_name && $profile->region_id,
            'has_specializations' => $profile && $profile->specializations()->exists(),
            'kyc_status' => $profile?->kyc_status ?? 'pending',
        ]);
    }

    public function updateExpertProfile(Request $request): JsonResponse
    {
        $profile = $request->user()->expertProfile;

        $validated = $request->validate([
            'business_name' => 'required|string|max:255',
            'bio' => 'nullable|string|max:1000',
            'experience_years' => 'required|integer|min:0',
            'region_id' => 'required|exists:regions,id',
            'city' => 'required|string|max:100',
            'address' => 'required|string|max:500',
            'whatsapp_number' => 'required|string|max:20',
            'specialization_ids' => 'required|array|min:1',
            'specialization_ids.*' => 'exists:specializations,id',
            'service_region_ids' => 'required|array|min:1',
            'service_region_ids.*' => 'exists:regions,id',
        ]);

        $profile->update(collect($validated)->except(['specialization_ids', 'service_region_ids'])->toArray());
        $profile->specializations()->sync($validated['specialization_ids']);
        $profile->serviceRegions()->sync($validated['service_region_ids']);

        return $this->success($profile->fresh()->load(['specializations', 'serviceRegions']), 'Profile updated');
    }

    public function completeExpertOnboarding(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user->expertProfile;

        // Validate requirements
        if (!$profile->business_name || !$profile->region_id) {
            return $this->error('Please complete your profile first.', 422);
        }

        if (!$profile->specializations()->exists()) {
            return $this->error('Please add at least one specialization.', 422);
        }

        $user->update(['onboarding_completed' => true]);

        return $this->success(null, 'Onboarding completed');
    }
}
