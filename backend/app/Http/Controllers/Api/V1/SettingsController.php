<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\RegionResource;
use App\Models\Region;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/regions",
     *     summary="List all regions",
     *     tags={"Settings"},
     *     @OA\Response(response=200, description="Success")
     * )
     */
    public function regions(): JsonResponse
    {
        $regions = Region::active()->orderBy('name')->get();
        return $this->success(RegionResource::collection($regions));
    }

    /**
     * Get public settings.
     */
    public function publicSettings(): JsonResponse
    {
        $settings = Setting::getPublicSettings();
        return $this->success($settings);
    }
}
