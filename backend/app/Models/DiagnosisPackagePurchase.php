<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class DiagnosisPackagePurchase extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'diagnosis_package_id',
        'diagnoses_purchased',
        'diagnoses_remaining',
        'amount_paid',
        'currency',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'diagnoses_purchased' => 'integer',
            'diagnoses_remaining' => 'integer',
            'amount_paid' => 'decimal:2',
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
        return $this->belongsTo(DiagnosisPackage::class, 'diagnosis_package_id');
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
        return $this->status === 'active' && $this->diagnoses_remaining > 0;
    }

    /**
     * Use a diagnosis from this purchase.
     */
    public function useDiagnosis(): bool
    {
        if (!$this->isActive()) {
            return false;
        }

        $this->decrement('diagnoses_remaining');

        if ($this->diagnoses_remaining <= 0) {
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
            ->where('diagnoses_remaining', '>', 0);
    }
}
