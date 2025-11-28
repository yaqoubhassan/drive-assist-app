<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ExpertResource;
use App\Http\Resources\ExpertProfileResource;
use App\Http\Resources\SpecializationResource;
use App\Models\User;
use App\Models\Specialization;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExpertController extends Controller
{
    public function specializations(): JsonResponse
    {
        $specs = Specialization::active()->orderBy('name')->get();
        return $this->success(SpecializationResource::collection($specs));
    }

    public function index(Request $request): JsonResponse
    {
        $query = User::where('role', 'expert')
            ->whereHas('expertProfile', fn($q) => $q->available()->kycApproved());

        if ($request->has('region_id')) {
            $query->whereHas('expertProfile.serviceRegions', fn($q) =>
                $q->where('region_id', $request->get('region_id'))
            );
        }

        if ($request->has('specialization_id')) {
            $query->whereHas('expertProfile.specializations', fn($q) =>
                $q->where('specialization_id', $request->get('specialization_id'))
            );
        }

        $experts = $query->with(['expertProfile.specializations', 'expertProfile.serviceRegions'])
            ->paginate(15);

        return $this->success(ExpertResource::collection($experts));
    }

    public function show(int $id): JsonResponse
    {
        $expert = User::where('role', 'expert')
            ->whereHas('expertProfile', fn($q) => $q->kycApproved())
            ->with(['expertProfile.specializations', 'expertProfile.serviceRegions', 'expertProfile.vehicleMakes'])
            ->findOrFail($id);

        return $this->success(new ExpertResource($expert));
    }

    public function myProfile(Request $request): JsonResponse
    {
        $profile = $request->user()->expertProfile()->with([
            'specializations', 'serviceRegions', 'vehicleMakes', 'region'
        ])->firstOrFail();

        return $this->success(new ExpertProfileResource($profile));
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $profile = $request->user()->expertProfile;

        $validated = $request->validate([
            'business_name' => 'sometimes|string|max:255',
            'bio' => 'sometimes|string|max:1000',
            'experience_years' => 'sometimes|integer|min:0|max:50',
            'region_id' => 'sometimes|exists:regions,id',
            'city' => 'sometimes|string|max:100',
            'address' => 'sometimes|string|max:500',
            'latitude' => 'sometimes|numeric|between:-90,90',
            'longitude' => 'sometimes|numeric|between:-180,180',
            'whatsapp_number' => 'sometimes|string|max:20',
            'alternate_phone' => 'sometimes|string|max:20',
            'working_hours' => 'sometimes|array',
            'specialization_ids' => 'sometimes|array',
            'specialization_ids.*' => 'exists:specializations,id',
            'service_region_ids' => 'sometimes|array',
            'service_region_ids.*' => 'exists:regions,id',
            'vehicle_make_ids' => 'sometimes|array',
            'vehicle_make_ids.*' => 'exists:vehicle_makes,id',
        ]);

        $profile->update(collect($validated)->except([
            'specialization_ids', 'service_region_ids', 'vehicle_make_ids'
        ])->toArray());

        if (isset($validated['specialization_ids'])) {
            $profile->specializations()->sync($validated['specialization_ids']);
        }
        if (isset($validated['service_region_ids'])) {
            $profile->serviceRegions()->sync($validated['service_region_ids']);
        }
        if (isset($validated['vehicle_make_ids'])) {
            $profile->vehicleMakes()->sync($validated['vehicle_make_ids']);
        }

        return $this->success(
            new ExpertProfileResource($profile->fresh()->load(['specializations', 'serviceRegions', 'vehicleMakes'])),
            'Profile updated'
        );
    }

    public function updateAvailability(Request $request): JsonResponse
    {
        $validated = $request->validate(['is_available' => 'required|boolean']);
        $request->user()->expertProfile->update($validated);
        return $this->success(null, 'Availability updated');
    }

    public function updateWorkingHours(Request $request): JsonResponse
    {
        $validated = $request->validate(['working_hours' => 'required|array']);
        $request->user()->expertProfile->update($validated);
        return $this->success(null, 'Working hours updated');
    }

    public function submitReview(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'lead_id' => 'required|exists:leads,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $lead = \App\Models\Lead::where('driver_id', $request->user()->id)->findOrFail($validated['lead_id']);

        $review = Review::create([
            'lead_id' => $lead->id,
            'expert_id' => $lead->expert_id,
            'driver_id' => $request->user()->id,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
        ]);

        return $this->success($review, 'Review submitted', 201);
    }

    public function myReviews(Request $request): JsonResponse
    {
        $reviews = Review::forExpert($request->user()->id)
            ->visible()
            ->with('driver')
            ->latest()
            ->paginate(15);

        return $this->success($reviews);
    }

    public function respondToReview(Request $request, int $id): JsonResponse
    {
        $review = Review::forExpert($request->user()->id)->findOrFail($id);

        $validated = $request->validate(['response' => 'required|string|max:1000']);

        $review->addExpertResponse($validated['response']);

        return $this->success($review->fresh(), 'Response added');
    }
}
