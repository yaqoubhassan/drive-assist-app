<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @OA\Schema(
 *     schema="User",
 *     type="object",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="first_name", type="string", example="John"),
 *     @OA\Property(property="last_name", type="string", example="Doe"),
 *     @OA\Property(property="full_name", type="string", example="John Doe"),
 *     @OA\Property(property="email", type="string", format="email", example="john@example.com"),
 *     @OA\Property(property="phone", type="string", example="+233201234567"),
 *     @OA\Property(property="role", type="string", enum={"guest","driver","expert","admin"}, example="driver"),
 *     @OA\Property(property="avatar", type="string", nullable=true),
 *     @OA\Property(property="email_verified", type="boolean", example=true),
 *     @OA\Property(property="phone_verified", type="boolean", example=false),
 *     @OA\Property(property="onboarding_completed", type="boolean", example=false),
 *     @OA\Property(property="kyc_completed", type="boolean", example=false),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="driver_profile", ref="#/components/schemas/DriverProfile", nullable=true),
 *     @OA\Property(property="expert_profile", ref="#/components/schemas/ExpertProfile", nullable=true),
 *     @OA\Property(property="preferences", ref="#/components/schemas/UserPreference", nullable=true)
 * )
 */
class UserResource extends JsonResource
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
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'role' => $this->role,
            'avatar' => $this->avatar,
            'email_verified' => $this->email_verified_at !== null,
            'phone_verified' => $this->phone_verified_at !== null,
            'onboarding_completed' => $this->onboarding_completed,
            'kyc_completed' => $this->hasCompletedKyc(),
            'created_at' => $this->created_at,
            'driver_profile' => $this->when($this->isDriver() && $this->relationLoaded('driverProfile'), function () {
                return new DriverProfileResource($this->driverProfile);
            }),
            'expert_profile' => $this->when($this->isExpert() && $this->relationLoaded('expertProfile'), function () {
                return new ExpertProfileResource($this->expertProfile);
            }),
            'preferences' => $this->when($this->relationLoaded('preferences'), function () {
                return new UserPreferenceResource($this->preferences);
            }),
            'vehicles' => $this->when($this->relationLoaded('vehicles'), function () {
                return VehicleResource::collection($this->vehicles);
            }),
        ];
    }
}
