<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VideoCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'color',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Get the videos in this category.
     */
    public function videos(): HasMany
    {
        return $this->hasMany(VideoResource::class);
    }

    /**
     * Get only published videos.
     */
    public function publishedVideos(): HasMany
    {
        return $this->hasMany(VideoResource::class)
            ->where('is_published', true)
            ->orderBy('sort_order');
    }

    /**
     * Scope for active categories.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to order by sort_order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }

    /**
     * Get video count for the category.
     */
    public function getVideoCountAttribute(): int
    {
        return $this->publishedVideos()->count();
    }
}
