<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class LeadPackage extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'leads_count',
        'price',
        'currency',
        'price_per_lead',
        'validity_days',
        'is_featured',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'leads_count' => 'integer',
            'price' => 'decimal:2',
            'price_per_lead' => 'decimal:2',
            'validity_days' => 'integer',
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
            if (empty($model->price_per_lead) && $model->leads_count > 0) {
                $model->price_per_lead = $model->price / $model->leads_count;
            }
        });
    }

    /**
     * Get purchases of this package.
     */
    public function purchases(): HasMany
    {
        return $this->hasMany(LeadPackagePurchase::class);
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
