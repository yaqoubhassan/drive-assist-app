<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class SubscriptionPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'billing_period',
        'price',
        'currency',
        'leads_per_month',
        'priority_listing',
        'featured_profile',
        'analytics_access',
        'is_active',
        'sort_order',
        'features',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'leads_per_month' => 'integer',
            'priority_listing' => 'boolean',
            'featured_profile' => 'boolean',
            'analytics_access' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'features' => 'array',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->slug)) {
                $model->slug = Str::slug($model->name . '-' . $model->billing_period);
            }
        });
    }

    /**
     * Get subscriptions for this plan.
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(ExpertSubscription::class);
    }

    /**
     * Get formatted price.
     */
    public function getFormattedPriceAttribute(): string
    {
        return $this->currency . ' ' . number_format($this->price, 2);
    }

    /**
     * Get billing period label.
     */
    public function getBillingPeriodLabelAttribute(): string
    {
        return match ($this->billing_period) {
            'monthly' => 'per month',
            'quarterly' => 'per quarter',
            'yearly' => 'per year',
            default => $this->billing_period,
        };
    }

    /**
     * Check if plan has unlimited leads.
     */
    public function hasUnlimitedLeads(): bool
    {
        return is_null($this->leads_per_month);
    }

    /**
     * Scope to only active plans.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
