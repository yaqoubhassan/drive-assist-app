<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @OA\Schema(
 *     schema="ExpertProfile",
 *     type="object",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="business_name", type="string", example="Auto Expert Services"),
 *     @OA\Property(property="bio", type="string"),
 *     @OA\Property(property="experience_years", type="integer", example=10),
 *     @OA\Property(property="region", ref="#/components/schemas/Region", nullable=true),
 *     @OA\Property(property="city", type="string", example="Accra"),
 *     @OA\Property(property="address", type="string"),
 *     @OA\Property(property="whatsapp_number", type="string"),
 *     @OA\Property(property="alternate_phone", type="string"),
 *     @OA\Property(property="kyc_status", type="string", enum={"pending","submitted","approved","rejected"}),
 *     @OA\Property(property="free_leads_remaining", type="integer", example=4),
 *     @OA\Property(property="total_leads_received", type="integer", example=0),
 *     @OA\Property(property="rating", type="number", format="float", example=4.5),
 *     @OA\Property(property="rating_count", type="integer", example=25),
 *     @OA\Property(property="jobs_completed", type="integer", example=50),
 *     @OA\Property(property="is_priority_listed", type="boolean"),
 *     @OA\Property(property="is_available", type="boolean"),
 *     @OA\Property(property="specializations", type="array", @OA\Items(ref="#/components/schemas/Specialization")),
 *     @OA\Property(property="service_regions", type="array", @OA\Items(ref="#/components/schemas/Region")),
 *     @OA\Property(property="vehicle_makes", type="array", @OA\Items(ref="#/components/schemas/VehicleMake"))
 * )
 */
class ExpertProfileResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'business_name' => $this->business_name,
            'bio' => $this->bio,
            'experience_years' => $this->experience_years,
            'region' => $this->when($this->relationLoaded('region'), function () {
                return new RegionResource($this->region);
            }),
            'city' => $this->city,
            'address' => $this->address,
            'location' => [
                'latitude' => $this->latitude,
                'longitude' => $this->longitude,
            ],
            'whatsapp_number' => $this->whatsapp_number,
            'alternate_phone' => $this->alternate_phone,
            'kyc_status' => $this->kyc_status,
            'kyc_submitted_at' => $this->kyc_submitted_at,
            'kyc_approved_at' => $this->kyc_approved_at,
            'kyc_rejection_reason' => $this->kyc_rejection_reason,
            'free_leads_remaining' => $this->free_leads_remaining,
            'total_leads_received' => $this->total_leads_received,
            'rating' => (float) $this->rating,
            'rating_count' => $this->rating_count,
            'jobs_completed' => $this->jobs_completed,
            'is_priority_listed' => $this->is_priority_listed,
            'is_available' => $this->is_available,
            'working_hours' => $this->working_hours,
            'specializations' => $this->when($this->relationLoaded('specializations'), function () {
                return SpecializationResource::collection($this->specializations);
            }),
            'service_regions' => $this->when($this->relationLoaded('serviceRegions'), function () {
                return RegionResource::collection($this->serviceRegions);
            }),
            'vehicle_makes' => $this->when($this->relationLoaded('vehicleMakes'), function () {
                return VehicleMakeResource::collection($this->vehicleMakes);
            }),
        ];
    }
}
