<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\RoadSign;
use App\Models\RoadSignCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoadSignController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/road-signs",
     *     summary="List all road signs",
     *     tags={"Road Signs"},
     *     @OA\Response(response=200, description="Success")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $query = RoadSign::active()->with('category')->ordered();

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('meaning', 'like', "%{$search}%");
            });
        }

        $signs = $query->paginate(20);

        return $this->success($signs);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/road-signs/categories",
     *     summary="List road sign categories",
     *     tags={"Road Signs"},
     *     @OA\Response(response=200, description="Success")
     * )
     */
    public function categories(): JsonResponse
    {
        $categories = RoadSignCategory::active()
            ->withCount(['roadSigns' => fn($q) => $q->active()])
            ->ordered()
            ->get();

        return $this->success($categories);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/road-signs/categories/{slug}",
     *     summary="Get signs by category",
     *     tags={"Road Signs"},
     *     @OA\Parameter(name="slug", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="Success")
     * )
     */
    public function byCategory(string $slug): JsonResponse
    {
        $category = RoadSignCategory::where('slug', $slug)->firstOrFail();

        $signs = $category->roadSigns()
            ->active()
            ->ordered()
            ->get();

        return $this->success([
            'category' => $category,
            'signs' => $signs,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/road-signs/{slug}",
     *     summary="Get road sign details",
     *     tags={"Road Signs"},
     *     @OA\Parameter(name="slug", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="Success")
     * )
     */
    public function show(string $slug): JsonResponse
    {
        $sign = RoadSign::where('slug', $slug)->with('category')->firstOrFail();
        return $this->success($sign);
    }
}
