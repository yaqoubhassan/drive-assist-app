<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @OA\Schema(
 *     schema="VehicleMake",
 *     type="object",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="Toyota"),
 *     @OA\Property(property="slug", type="string", example="toyota"),
 *     @OA\Property(property="logo", type="string"),
 *     @OA\Property(property="country_of_origin", type="string", example="Japan")
 * )
 */
class VehicleMakeResource extends JsonResource
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
            'name' => $this->name,
            'slug' => $this->slug,
            'logo' => $this->logo,
            'country_of_origin' => $this->country_of_origin,
            'models' => $this->when($this->relationLoaded('models'), function () {
                return VehicleModelResource::collection($this->models);
            }),
        ];
    }
}
