<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class DiagnosisPackage extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'diagnoses_count',
        'price',
        'currency',
        'price_per_diagnosis',
        'includes_images',
        'includes_voice',
        'includes_expert_contact',
        'is_featured',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'diagnoses_count' => 'integer',
            'price' => 'decimal:2',
            'price_per_diagnosis' => 'decimal:2',
            'includes_images' => 'boolean',
            'includes_voice' => 'boolean',
            'includes_expert_contact' => 'boolean',
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
            if (empty($model->price_per_diagnosis) && $model->diagnoses_count > 0) {
                $model->price_per_diagnosis = $model->price / $model->diagnoses_count;
            }
        });
    }

    /**
     * Get purchases of this package.
     */
    public function purchases(): HasMany
    {
        return $this->hasMany(DiagnosisPackagePurchase::class);
    }

    /**
     * Get formatted price.
     */
    public function getFormattedPriceAttribute(): string
    {
        return $this->currency . ' ' . number_format($this->price, 2);
    }

    /**
     * Scope to only active packages.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to featured packages.
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }
}
