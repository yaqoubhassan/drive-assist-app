<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @OA\Schema(
 *     schema="Vehicle",
 *     type="object",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="make", type="string", example="Toyota"),
 *     @OA\Property(property="model", type="string", example="Camry"),
 *     @OA\Property(property="display_name", type="string", example="2020 Toyota Camry"),
 *     @OA\Property(property="year", type="integer", example=2020),
 *     @OA\Property(property="color", type="string", example="Silver"),
 *     @OA\Property(property="license_plate", type="string", example="GR-1234-20"),
 *     @OA\Property(property="vin", type="string"),
 *     @OA\Property(property="fuel_type", type="string", enum={"petrol","diesel","electric","hybrid","lpg","other"}),
 *     @OA\Property(property="transmission", type="string", enum={"manual","automatic","cvt","other"}),
 *     @OA\Property(property="mileage", type="integer", example=50000),
 *     @OA\Property(property="mileage_unit", type="string", enum={"km","miles"}),
 *     @OA\Property(property="nickname", type="string"),
 *     @OA\Property(property="image_url", type="string"),
 *     @OA\Property(property="is_primary", type="boolean")
 * )
 */
class VehicleResource extends JsonResource
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
            'make' => $this->make_name,
            'make_id' => $this->vehicle_make_id,
            'model' => $this->model_name,
            'model_id' => $this->vehicle_model_id,
            'display_name' => $this->display_name,
            'year' => $this->year,
            'color' => $this->color,
            'license_plate' => $this->license_plate,
            'vin' => $this->vin,
            'fuel_type' => $this->fuel_type,
            'transmission' => $this->transmission,
            'mileage' => $this->mileage,
            'mileage_unit' => $this->mileage_unit,
            'nickname' => $this->nickname,
            'image_url' => $this->getImageUrl($request),
            'is_primary' => $this->is_primary,
            'vehicle_make' => $this->when($this->relationLoaded('make'), function () {
                return new VehicleMakeResource($this->make);
            }),
            'vehicle_model' => $this->when($this->relationLoaded('model'), function () {
                return new VehicleModelResource($this->model);
            }),
        ];
    }

    /**
     * Get the full image URL using the request's base URL
     */
    private function getImageUrl(Request $request): ?string
    {
        if (!$this->image) {
            return null;
        }

        // Build URL using the request's scheme and host (works with ngrok, localhost, etc.)
        $baseUrl = $request->getSchemeAndHttpHost();
        return $baseUrl . '/storage/' . $this->image;
    }
}
