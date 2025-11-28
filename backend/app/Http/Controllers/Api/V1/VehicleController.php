<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\VehicleResource;
use App\Http\Resources\VehicleMakeResource;
use App\Http\Resources\VehicleModelResource;
use App\Models\Vehicle;
use App\Models\VehicleMake;
use App\Models\VehicleModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class VehicleController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/vehicle-makes",
     *     summary="List all vehicle makes",
     *     tags={"Vehicles"},
     *     @OA\Response(response=200, description="Success")
     * )
     */
    public function makes(): JsonResponse
    {
        $makes = VehicleMake::active()->orderBy('name')->get();
        return $this->success(VehicleMakeResource::collection($makes));
    }

    /**
     * @OA\Get(
     *     path="/api/v1/vehicle-makes/{make}/models",
     *     summary="List models for a make",
     *     tags={"Vehicles"},
     *     @OA\Parameter(name="make", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Success")
     * )
     */
    public function modelsByMake(int $makeId): JsonResponse
    {
        $make = VehicleMake::findOrFail($makeId);
        $models = $make->models()->active()->orderBy('name')->get();
        return $this->success(VehicleModelResource::collection($models));
    }

    /**
     * @OA\Get(
     *     path="/api/v1/vehicles",
     *     summary="List user vehicles",
     *     tags={"Vehicles"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Success")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $vehicles = $request->user()
            ->vehicles()
            ->with(['make', 'model'])
            ->orderByDesc('is_primary')
            ->orderByDesc('created_at')
            ->get();

        return $this->success(VehicleResource::collection($vehicles));
    }

    /**
     * @OA\Post(
     *     path="/api/v1/vehicles",
     *     summary="Add a vehicle",
     *     tags={"Vehicles"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(required=true, @OA\JsonContent(
     *         @OA\Property(property="vehicle_make_id", type="integer"),
     *         @OA\Property(property="vehicle_model_id", type="integer"),
     *         @OA\Property(property="custom_make", type="string"),
     *         @OA\Property(property="custom_model", type="string"),
     *         @OA\Property(property="year", type="integer"),
     *         @OA\Property(property="color", type="string"),
     *         @OA\Property(property="license_plate", type="string"),
     *         @OA\Property(property="fuel_type", type="string"),
     *         @OA\Property(property="transmission", type="string"),
     *         @OA\Property(property="mileage", type="integer"),
     *         @OA\Property(property="nickname", type="string"),
     *         @OA\Property(property="is_primary", type="boolean")
     *     )),
     *     @OA\Response(response=201, description="Vehicle created")
     * )
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'vehicle_make_id' => 'nullable|exists:vehicle_makes,id',
            'vehicle_model_id' => 'nullable|exists:vehicle_models,id',
            'custom_make' => 'nullable|string|max:100',
            'custom_model' => 'nullable|string|max:100',
            'year' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
            'color' => 'nullable|string|max:50',
            'license_plate' => 'nullable|string|max:20',
            'vin' => 'nullable|string|max:50',
            'fuel_type' => 'nullable|in:petrol,diesel,electric,hybrid,lpg,other',
            'transmission' => 'nullable|in:manual,automatic,cvt,other',
            'mileage' => 'nullable|integer|min:0',
            'mileage_unit' => 'nullable|in:km,miles',
            'nickname' => 'nullable|string|max:100',
            'is_primary' => 'boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:5120',
        ]);

        // Require either make_id or custom_make
        if (empty($validated['vehicle_make_id']) && empty($validated['custom_make'])) {
            return $this->error('Please provide either a vehicle make or custom make name.', 422);
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('vehicles', 'public');
        }

        // If setting as primary, unset other primaries
        if ($validated['is_primary'] ?? false) {
            $request->user()->vehicles()->update(['is_primary' => false]);
        }

        // If this is the first vehicle, make it primary
        if ($request->user()->vehicles()->count() === 0) {
            $validated['is_primary'] = true;
        }

        $validated['user_id'] = $request->user()->id;
        $vehicle = Vehicle::create($validated);

        return $this->success(
            new VehicleResource($vehicle->load(['make', 'model'])),
            'Vehicle added successfully',
            201
        );
    }

    /**
     * @OA\Get(
     *     path="/api/v1/vehicles/{id}",
     *     summary="Get vehicle details",
     *     tags={"Vehicles"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Success")
     * )
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $vehicle = $request->user()->vehicles()->with(['make', 'model'])->findOrFail($id);
        return $this->success(new VehicleResource($vehicle));
    }

    /**
     * @OA\Put(
     *     path="/api/v1/vehicles/{id}",
     *     summary="Update vehicle",
     *     tags={"Vehicles"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Success")
     * )
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $vehicle = $request->user()->vehicles()->findOrFail($id);

        $validated = $request->validate([
            'vehicle_make_id' => 'nullable|exists:vehicle_makes,id',
            'vehicle_model_id' => 'nullable|exists:vehicle_models,id',
            'custom_make' => 'nullable|string|max:100',
            'custom_model' => 'nullable|string|max:100',
            'year' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
            'color' => 'nullable|string|max:50',
            'license_plate' => 'nullable|string|max:20',
            'vin' => 'nullable|string|max:50',
            'fuel_type' => 'nullable|in:petrol,diesel,electric,hybrid,lpg,other',
            'transmission' => 'nullable|in:manual,automatic,cvt,other',
            'mileage' => 'nullable|integer|min:0',
            'mileage_unit' => 'nullable|in:km,miles',
            'nickname' => 'nullable|string|max:100',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:5120',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image
            if ($vehicle->image) {
                Storage::disk('public')->delete($vehicle->image);
            }
            $validated['image'] = $request->file('image')->store('vehicles', 'public');
        }

        $vehicle->update($validated);

        return $this->success(
            new VehicleResource($vehicle->load(['make', 'model'])),
            'Vehicle updated successfully'
        );
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/vehicles/{id}",
     *     summary="Delete vehicle",
     *     tags={"Vehicles"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Success")
     * )
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $vehicle = $request->user()->vehicles()->findOrFail($id);

        // Delete image if exists
        if ($vehicle->image) {
            Storage::disk('public')->delete($vehicle->image);
        }

        $vehicle->delete();

        return $this->success(null, 'Vehicle deleted successfully');
    }

    /**
     * @OA\Put(
     *     path="/api/v1/vehicles/{id}/primary",
     *     summary="Set vehicle as primary",
     *     tags={"Vehicles"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Success")
     * )
     */
    public function setPrimary(Request $request, int $id): JsonResponse
    {
        $vehicle = $request->user()->vehicles()->findOrFail($id);

        // Unset all primaries
        $request->user()->vehicles()->update(['is_primary' => false]);

        // Set this one as primary
        $vehicle->update(['is_primary' => true]);

        return $this->success(
            new VehicleResource($vehicle->load(['make', 'model'])),
            'Vehicle set as primary'
        );
    }
}
