<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class ServicePackage extends Model
{
    use HasFactory;

    protected $fillable = [
        'expert_id',
        'name',
        'slug',
        'description',
        'category',
        'price',
        'price_max',
        'currency',
        'duration_minutes',
        'includes',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'price_max' => 'decimal:2',
        'duration_minutes' => 'integer',
        'includes' => 'array',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    // Categories
    const CATEGORY_DIAGNOSTIC = 'diagnostic';
    const CATEGORY_REPAIR = 'repair';
    const CATEGORY_MAINTENANCE = 'maintenance';
    const CATEGORY_INSPECTION = 'inspection';

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($package) {
            if (empty($package->slug)) {
                $package->slug = Str::slug($package->name);
            }
        });
    }

    /**
     * Get the expert who owns this package.
     */
    public function expert(): BelongsTo
    {
        return $this->belongsTo(User::class, 'expert_id');
    }

    /**
     * Get the expert profile.
     */
    public function expertProfile(): BelongsTo
    {
        return $this->belongsTo(ExpertProfile::class, 'expert_id', 'user_id');
    }

    /**
     * Scope for active packages.
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
     * Scope by category.
     */
    public function scopeCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Get formatted price range.
     */
    public function getPriceRangeAttribute(): string
    {
        if ($this->price_max && $this->price_max > $this->price) {
            return "{$this->currency} {$this->price} - {$this->price_max}";
        }
        return "{$this->currency} {$this->price}";
    }

    /**
     * Get formatted duration.
     */
    public function getFormattedDurationAttribute(): string
    {
        if ($this->duration_minutes < 60) {
            return "{$this->duration_minutes} mins";
        }

        $hours = floor($this->duration_minutes / 60);
        $mins = $this->duration_minutes % 60;

        if ($mins > 0) {
            return "{$hours}h {$mins}m";
        }

        return "{$hours} hour" . ($hours > 1 ? 's' : '');
    }
}
