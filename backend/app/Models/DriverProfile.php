<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DriverProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'region_id',
        'city',
        'license_number',
        'license_expiry',
        'driving_experience_years',
        'free_diagnoses_remaining',
        'paid_diagnoses_remaining',
        'total_diagnoses_used',
    ];

    protected function casts(): array
    {
        return [
            'license_expiry' => 'date',
            'driving_experience_years' => 'integer',
            'free_diagnoses_remaining' => 'integer',
            'paid_diagnoses_remaining' => 'integer',
            'total_diagnoses_used' => 'integer',
        ];
    }

    /**
     * Get the user for this profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the region.
     */
    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    /**
     * Check if driver has free diagnoses remaining.
     */
    public function hasFreeDiagnosesRemaining(): bool
    {
        return $this->free_diagnoses_remaining > 0;
    }

    /**
     * Check if driver has any diagnoses remaining (free or paid).
     */
    public function hasDiagnosesRemaining(): bool
    {
        return $this->free_diagnoses_remaining > 0 || $this->paid_diagnoses_remaining > 0;
    }

    /**
     * Get total available diagnoses.
     */
    public function getTotalDiagnosesAvailableAttribute(): int
    {
        return $this->free_diagnoses_remaining + $this->paid_diagnoses_remaining;
    }

    /**
     * Use a diagnosis (free first, then paid).
     */
    public function useDiagnosis(): bool
    {
        if ($this->free_diagnoses_remaining > 0) {
            $this->decrement('free_diagnoses_remaining');
            $this->increment('total_diagnoses_used');
            return true;
        }

        if ($this->paid_diagnoses_remaining > 0) {
            $this->decrement('paid_diagnoses_remaining');
            $this->increment('total_diagnoses_used');
            return true;
        }

        return false;
    }

    /**
     * Add paid diagnoses (after purchase).
     */
    public function addPaidDiagnoses(int $count): void
    {
        $this->increment('paid_diagnoses_remaining', $count);
    }
}
