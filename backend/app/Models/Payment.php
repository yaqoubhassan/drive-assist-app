<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Str;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'payable_type',
        'payable_id',
        'payment_reference',
        'provider',
        'provider_reference',
        'amount',
        'currency',
        'status',
        'provider_response',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'provider_response' => 'array',
            'completed_at' => 'datetime',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->payment_reference)) {
                $model->payment_reference = 'PAY-' . strtoupper(Str::random(16));
            }
        });
    }

    /**
     * Get the user.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the payable model (polymorphic).
     */
    public function payable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Check if payment is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Check if payment is pending.
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if payment failed.
     */
    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    /**
     * Mark payment as completed.
     */
    public function markAsCompleted(?string $providerReference = null, ?array $providerResponse = null): void
    {
        $this->update([
            'status' => 'completed',
            'provider_reference' => $providerReference ?? $this->provider_reference,
            'provider_response' => $providerResponse ?? $this->provider_response,
            'completed_at' => now(),
        ]);
    }

    /**
     * Mark payment as failed.
     */
    public function markAsFailed(?array $providerResponse = null): void
    {
        $this->update([
            'status' => 'failed',
            'provider_response' => $providerResponse ?? $this->provider_response,
        ]);
    }

    /**
     * Get formatted amount.
     */
    public function getFormattedAmountAttribute(): string
    {
        return $this->currency . ' ' . number_format($this->amount, 2);
    }

    /**
     * Scope to completed payments.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope to pending payments.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}
