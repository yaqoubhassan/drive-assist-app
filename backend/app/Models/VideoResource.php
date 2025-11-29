<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VideoResource extends Model
{
    use HasFactory;

    protected $fillable = [
        'video_category_id',
        'title',
        'slug',
        'description',
        'youtube_id',
        'youtube_url',
        'thumbnail_url',
        'channel_name',
        'channel_url',
        'duration_seconds',
        'duration_formatted',
        'views_count',
        'likes_count',
        'sort_order',
        'is_featured',
        'is_published',
    ];

    protected $casts = [
        'duration_seconds' => 'integer',
        'views_count' => 'integer',
        'likes_count' => 'integer',
        'sort_order' => 'integer',
        'is_featured' => 'boolean',
        'is_published' => 'boolean',
    ];

    /**
     * Get the category this video belongs to.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(VideoCategory::class, 'video_category_id');
    }

    /**
     * Scope for published videos.
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    /**
     * Scope for featured videos.
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope to order by sort_order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }

    /**
     * Increment view count.
     */
    public function incrementViews(): void
    {
        $this->increment('views_count');
    }

    /**
     * Get YouTube embed URL.
     */
    public function getEmbedUrlAttribute(): string
    {
        return "https://www.youtube.com/embed/{$this->youtube_id}";
    }

    /**
     * Get YouTube watch URL.
     */
    public function getWatchUrlAttribute(): string
    {
        return "https://www.youtube.com/watch?v={$this->youtube_id}";
    }

    /**
     * Get high-quality thumbnail.
     */
    public function getHqThumbnailAttribute(): string
    {
        return $this->thumbnail_url ?: "https://img.youtube.com/vi/{$this->youtube_id}/hqdefault.jpg";
    }

    /**
     * Get max resolution thumbnail.
     */
    public function getMaxThumbnailAttribute(): string
    {
        return "https://img.youtube.com/vi/{$this->youtube_id}/maxresdefault.jpg";
    }
}
