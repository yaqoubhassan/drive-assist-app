<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @OA\Schema(
 *     schema="Specialization",
 *     type="object",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="Engine Repair"),
 *     @OA\Property(property="slug", type="string", example="engine-repair"),
 *     @OA\Property(property="icon", type="string"),
 *     @OA\Property(property="description", type="string")
 * )
 */
class SpecializationResource extends JsonResource
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
            'icon' => $this->icon,
            'description' => $this->description,
        ];
    }
}
