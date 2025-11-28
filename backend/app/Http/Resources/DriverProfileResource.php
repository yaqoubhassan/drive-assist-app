<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @OA\Schema(
 *     schema="DriverProfile",
 *     type="object",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="region", ref="#/components/schemas/Region", nullable=true),
 *     @OA\Property(property="city", type="string", example="Accra"),
 *     @OA\Property(property="license_number", type="string", nullable=true),
 *     @OA\Property(property="license_expiry", type="string", format="date", nullable=true),
 *     @OA\Property(property="driving_experience_years", type="integer", example=5),
 *     @OA\Property(property="free_diagnoses_remaining", type="integer", example=5),
 *     @OA\Property(property="paid_diagnoses_remaining", type="integer", example=0),
 *     @OA\Property(property="total_diagnoses_available", type="integer", example=5),
 *     @OA\Property(property="total_diagnoses_used", type="integer", example=0)
 * )
 */
class DriverProfileResource extends JsonResource
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
            'region' => $this->when($this->relationLoaded('region'), function () {
                return new RegionResource($this->region);
            }),
            'city' => $this->city,
            'license_number' => $this->license_number,
            'license_expiry' => $this->license_expiry?->format('Y-m-d'),
            'driving_experience_years' => $this->driving_experience_years,
            'free_diagnoses_remaining' => $this->free_diagnoses_remaining,
            'paid_diagnoses_remaining' => $this->paid_diagnoses_remaining,
            'total_diagnoses_available' => $this->total_diagnoses_available,
            'total_diagnoses_used' => $this->total_diagnoses_used,
        ];
    }
}
