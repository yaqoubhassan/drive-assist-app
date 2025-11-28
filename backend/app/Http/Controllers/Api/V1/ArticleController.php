<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\ArticleCategory;
use App\Models\ArticleInteraction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/articles",
     *     summary="List articles",
     *     tags={"Articles"},
     *     @OA\Response(response=200, description="Success")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $query = Article::published()->with('category');

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        if ($request->has('category')) {
            $category = ArticleCategory::where('slug', $request->get('category'))->first();
            if ($category) {
                $query->inCategory($category->id);
            }
        }

        $articles = $query->latest('published_at')->paginate(15);

        return $this->success($articles);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/articles/categories",
     *     summary="List article categories",
     *     tags={"Articles"},
     *     @OA\Response(response=200, description="Success")
     * )
     */
    public function categories(): JsonResponse
    {
        $categories = ArticleCategory::active()
            ->withCount(['articles' => fn($q) => $q->published()])
            ->ordered()
            ->get();

        return $this->success($categories);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/articles/categories/{slug}",
     *     summary="Get articles by category",
     *     tags={"Articles"},
     *     @OA\Parameter(name="slug", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="Success")
     * )
     */
    public function byCategory(string $slug): JsonResponse
    {
        $category = ArticleCategory::where('slug', $slug)->firstOrFail();

        $articles = $category->publishedArticles()
            ->paginate(15);

        return $this->success([
            'category' => $category,
            'articles' => $articles,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/articles/{slug}",
     *     summary="Get article details",
     *     tags={"Articles"},
     *     @OA\Parameter(name="slug", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="Success")
     * )
     */
    public function show(Request $request, string $slug): JsonResponse
    {
        $article = Article::where('slug', $slug)
            ->published()
            ->with('category', 'author')
            ->firstOrFail();

        // Increment views
        $article->incrementViews();

        // Get user interaction if authenticated
        $interaction = null;
        if ($request->user()) {
            $interaction = ArticleInteraction::where('user_id', $request->user()->id)
                ->where('article_id', $article->id)
                ->first();
        }

        $data = $article->toArray();
        $data['user_liked'] = $interaction?->liked ?? false;
        $data['user_bookmarked'] = $interaction?->bookmarked ?? false;

        return $this->success($data);
    }

    /**
     * Toggle like on article.
     */
    public function toggleLike(Request $request, int $id): JsonResponse
    {
        $article = Article::findOrFail($id);

        $interaction = ArticleInteraction::firstOrCreate([
            'user_id' => $request->user()->id,
            'article_id' => $article->id,
        ]);

        $liked = $interaction->toggleLike();

        return $this->success([
            'liked' => $liked,
            'likes_count' => $article->fresh()->likes_count,
        ]);
    }

    /**
     * Toggle bookmark on article.
     */
    public function toggleBookmark(Request $request, int $id): JsonResponse
    {
        $article = Article::findOrFail($id);

        $interaction = ArticleInteraction::firstOrCreate([
            'user_id' => $request->user()->id,
            'article_id' => $article->id,
        ]);

        $bookmarked = $interaction->toggleBookmark();

        return $this->success(['bookmarked' => $bookmarked]);
    }

    /**
     * Get bookmarked articles.
     */
    public function bookmarked(Request $request): JsonResponse
    {
        $articleIds = ArticleInteraction::where('user_id', $request->user()->id)
            ->where('bookmarked', true)
            ->pluck('article_id');

        $articles = Article::whereIn('id', $articleIds)
            ->published()
            ->with('category')
            ->latest()
            ->paginate(15);

        return $this->success($articles);
    }
}
