<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class LeadPackagePurchase extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'lead_package_id',
        'leads_purchased',
        'leads_remaining',
        'amount_paid',
        'currency',
        'status',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'leads_purchased' => 'integer',
            'leads_remaining' => 'integer',
            'amount_paid' => 'decimal:2',
            'expires_at' => 'datetime',
        ];
    }

    /**
     * Get the user.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the package.
     */
    public function package(): BelongsTo
    {
        return $this->belongsTo(LeadPackage::class, 'lead_package_id');
    }

    /**
     * Get payments for this purchase.
     */
    public function payments(): MorphMany
    {
        return $this->morphMany(Payment::class, 'payable');
    }

    /**
     * Check if purchase is active.
     */
    public function isActive(): bool
    {
        if ($this->status !== 'active') {
            return false;
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        return $this->leads_remaining > 0;
    }

    /**
     * Check if purchase is expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    /**
     * Use a lead from this purchase.
     */
    public function useLead(): bool
    {
        if (!$this->isActive()) {
            return false;
        }

        $this->decrement('leads_remaining');

        if ($this->leads_remaining <= 0) {
            $this->update(['status' => 'exhausted']);
        }

        return true;
    }

    /**
     * Scope to active purchases.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active')
            ->where('leads_remaining', '>', 0)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            });
    }
}
