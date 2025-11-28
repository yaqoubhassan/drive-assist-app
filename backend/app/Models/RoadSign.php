<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class RoadSign extends Model
{
    use HasFactory;

    protected $fillable = [
        'road_sign_category_id',
        'name',
        'slug',
        'description',
        'meaning',
        'image',
        'thumbnail',
        'tips',
        'common_locations',
        'penalties',
        'is_featured',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'tips' => 'array',
            'common_locations' => 'array',
            'penalties' => 'array',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
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
     * Get the category.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(RoadSignCategory::class, 'road_sign_category_id');
    }

    /**
     * Get quiz questions related to this sign.
     */
    public function quizQuestions(): HasMany
    {
        return $this->hasMany(QuizQuestion::class);
    }

    /**
     * Scope to active signs.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to featured signs.
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope ordered by sort order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }
}
