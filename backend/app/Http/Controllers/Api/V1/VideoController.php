<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\VideoCategory;
use App\Models\VideoResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VideoController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/videos/categories",
     *     summary="List video categories",
     *     tags={"Videos"},
     *     @OA\Response(response=200, description="Success")
     * )
     */
    public function categories(): JsonResponse
    {
        $categories = VideoCategory::active()
            ->ordered()
            ->withCount(['videos' => function ($query) {
                $query->where('is_published', true);
            }])
            ->get()
            ->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'description' => $category->description,
                    'icon' => $category->icon,
                    'color' => $category->color,
                    'video_count' => $category->videos_count,
                ];
            });

        return $this->success($categories);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/videos",
     *     summary="List all videos",
     *     tags={"Videos"},
     *     @OA\Parameter(name="category", in="query", @OA\Schema(type="string")),
     *     @OA\Parameter(name="featured", in="query", @OA\Schema(type="boolean")),
     *     @OA\Parameter(name="search", in="query", @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="Success")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $query = VideoResource::published()
            ->with('category')
            ->ordered();

        // Filter by category
        if ($request->has('category')) {
            $category = VideoCategory::where('slug', $request->category)->first();
            if ($category) {
                $query->where('video_category_id', $category->id);
            }
        }

        // Filter featured
        if ($request->boolean('featured')) {
            $query->featured();
        }

        // Search
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('channel_name', 'like', "%{$search}%");
            });
        }

        $videos = $query->paginate(15);

        return $this->success([
            'data' => $videos->map(function ($video) {
                return $this->formatVideo($video);
            }),
            'current_page' => $videos->currentPage(),
            'last_page' => $videos->lastPage(),
            'total' => $videos->total(),
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/videos/featured",
     *     summary="Get featured videos",
     *     tags={"Videos"},
     *     @OA\Response(response=200, description="Success")
     * )
     */
    public function featured(): JsonResponse
    {
        $videos = VideoResource::published()
            ->featured()
            ->with('category')
            ->ordered()
            ->limit(10)
            ->get()
            ->map(function ($video) {
                return $this->formatVideo($video);
            });

        return $this->success($videos);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/videos/categories/{slug}",
     *     summary="Get videos by category",
     *     tags={"Videos"},
     *     @OA\Parameter(name="slug", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="Success")
     * )
     */
    public function byCategory(string $slug): JsonResponse
    {
        $category = VideoCategory::where('slug', $slug)->firstOrFail();

        $videos = VideoResource::where('video_category_id', $category->id)
            ->published()
            ->ordered()
            ->get()
            ->map(function ($video) {
                return $this->formatVideo($video);
            });

        return $this->success([
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
                'icon' => $category->icon,
                'color' => $category->color,
            ],
            'videos' => $videos,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/videos/{slug}",
     *     summary="Get video details",
     *     tags={"Videos"},
     *     @OA\Parameter(name="slug", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="Success")
     * )
     */
    public function show(string $slug): JsonResponse
    {
        $video = VideoResource::where('slug', $slug)
            ->published()
            ->with('category')
            ->firstOrFail();

        // Increment view count
        $video->incrementViews();

        // Get related videos from same category
        $related = VideoResource::where('video_category_id', $video->video_category_id)
            ->where('id', '!=', $video->id)
            ->published()
            ->ordered()
            ->limit(5)
            ->get()
            ->map(function ($v) {
                return $this->formatVideo($v);
            });

        return $this->success([
            'video' => $this->formatVideo($video, true),
            'related' => $related,
        ]);
    }

    /**
     * Format video for response.
     */
    private function formatVideo(VideoResource $video, bool $detailed = false): array
    {
        $data = [
            'id' => $video->id,
            'title' => $video->title,
            'slug' => $video->slug,
            'description' => $video->description,
            'youtube_id' => $video->youtube_id,
            'youtube_url' => $video->youtube_url,
            'thumbnail_url' => $video->hq_thumbnail,
            'channel_name' => $video->channel_name,
            'duration_seconds' => $video->duration_seconds,
            'duration_formatted' => $video->duration_formatted,
            'views_count' => $video->views_count,
            'is_featured' => $video->is_featured,
            'category' => $video->category ? [
                'id' => $video->category->id,
                'name' => $video->category->name,
                'slug' => $video->category->slug,
                'color' => $video->category->color,
            ] : null,
        ];

        if ($detailed) {
            $data['embed_url'] = $video->embed_url;
            $data['watch_url'] = $video->watch_url;
            $data['channel_url'] = $video->channel_url;
            $data['likes_count'] = $video->likes_count;
            $data['max_thumbnail'] = $video->max_thumbnail;
        }

        return $data;
    }
}
