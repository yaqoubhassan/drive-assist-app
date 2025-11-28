<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class RoadSignCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'color',
        'icon',
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
     * Get road signs in this category.
     */
    public function roadSigns(): HasMany
    {
        return $this->hasMany(RoadSign::class)->orderBy('sort_order');
    }

    /**
     * Get quiz questions for this category.
     */
    public function quizQuestions(): HasMany
    {
        return $this->hasMany(QuizQuestion::class);
    }

    /**
     * Get signs count.
     */
    public function getSignsCountAttribute(): int
    {
        return $this->roadSigns()->count();
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
