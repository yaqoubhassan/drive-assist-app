<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @OA\Schema(
 *     schema="VehicleModel",
 *     type="object",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="Camry"),
 *     @OA\Property(property="slug", type="string", example="camry"),
 *     @OA\Property(property="type", type="string", enum={"sedan","suv","hatchback","pickup","van","coupe","wagon","convertible","motorcycle","truck","bus","other"})
 * )
 */
class VehicleModelResource extends JsonResource
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
            'type' => $this->type,
            'make_id' => $this->vehicle_make_id,
        ];
    }
}
