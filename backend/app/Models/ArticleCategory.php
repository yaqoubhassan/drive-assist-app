<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class ArticleCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'color',
        'image',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->slug)) {
                $model->slug = Str::slug($model->name);
            }
        });
    }

    /**
     * Get articles in this category.
     */
    public function articles(): HasMany
    {
        return $this->hasMany(Article::class)->orderBy('created_at', 'desc');
    }

    /**
     * Get published articles.
     */
    public function publishedArticles(): HasMany
    {
        return $this->hasMany(Article::class)
            ->where('is_published', true)
            ->orderBy('published_at', 'desc');
    }

    /**
     * Get articles count.
     */
    public function getArticlesCountAttribute(): int
    {
        return $this->articles()->count();
    }

    /**
     * Scope to active categories.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope ordered by sort order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }
}
