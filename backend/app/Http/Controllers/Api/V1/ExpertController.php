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
use Illuminate\Support\Facades\DB;

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

        // Location-based search using Haversine formula
        if ($request->has('latitude') && $request->has('longitude')) {
            $lat = (float) $request->get('latitude');
            $lng = (float) $request->get('longitude');
            $radius = (float) $request->get('radius', 50); // Default 50km radius

            // Haversine formula for calculating distance in kilometers
            $haversine = "(6371 * acos(cos(radians($lat))
                         * cos(radians(expert_profiles.latitude))
                         * cos(radians(expert_profiles.longitude) - radians($lng))
                         + sin(radians($lat))
                         * sin(radians(expert_profiles.latitude))))";

            $query->join('expert_profiles', 'users.id', '=', 'expert_profiles.user_id')
                ->whereNotNull('expert_profiles.latitude')
                ->whereNotNull('expert_profiles.longitude')
                ->whereRaw("$haversine < ?", [$radius])
                ->selectRaw("users.*, $haversine as distance")
                ->orderBy('distance', 'asc');
        }

        $experts = $query->with(['expertProfile.specializations', 'expertProfile.serviceRegions'])
            ->paginate(15);

        return $this->success(ExpertResource::collection($experts));
    }

    /**
     * Find nearby experts based on location.
     * This endpoint is publicly accessible for guest users.
     */
    public function nearby(Request $request): JsonResponse
    {
        $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'radius' => 'sometimes|numeric|min:1|max:100',
            'limit' => 'sometimes|integer|min:1|max:20',
            'specialization_id' => 'sometimes|exists:specializations,id',
        ]);

        $lat = (float) $request->get('latitude');
        $lng = (float) $request->get('longitude');
        $radius = (float) $request->get('radius', 25); // Default 25km
        $limit = (int) $request->get('limit', 10);

        // Haversine formula for calculating distance in kilometers
        $haversine = "(6371 * acos(cos(radians($lat))
                     * cos(radians(expert_profiles.latitude))
                     * cos(radians(expert_profiles.longitude) - radians($lng))
                     + sin(radians($lat))
                     * sin(radians(expert_profiles.latitude))))";

        $query = User::where('role', 'expert')
            ->join('expert_profiles', 'users.id', '=', 'expert_profiles.user_id')
            ->where('expert_profiles.is_available', true)
            ->where('expert_profiles.kyc_status', 'approved')
            ->whereNotNull('expert_profiles.latitude')
            ->whereNotNull('expert_profiles.longitude')
            ->whereRaw("$haversine < ?", [$radius])
            ->selectRaw("users.*, $haversine as distance");

        if ($request->has('specialization_id')) {
            $query->whereHas('expertProfile.specializations', fn($q) =>
                $q->where('specialization_id', $request->get('specialization_id'))
            );
        }

        // Sort by: priority listing first, then by distance, then by rating
        $experts = $query->orderByDesc('expert_profiles.is_priority_listed')
            ->orderBy('distance')
            ->orderByDesc('expert_profiles.rating')
            ->limit($limit)
            ->with(['expertProfile.specializations'])
            ->get();

        // Format response with distance info
        $result = $experts->map(function ($expert) {
            $resource = new ExpertResource($expert);
            $data = $resource->toArray(request());
            $data['distance_km'] = round($expert->distance, 1);
            return $data;
        });

        return $this->success($result);
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
