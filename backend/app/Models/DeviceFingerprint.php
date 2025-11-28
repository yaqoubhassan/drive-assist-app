<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DeviceFingerprint extends Model
{
    use HasFactory;

    protected $fillable = [
        'device_id',
        'device_type',
        'device_model',
        'os_version',
        'app_version',
        'ip_address',
        'diagnoses_used',
        'user_id',
    ];

    protected function casts(): array
    {
        return [
            'diagnoses_used' => 'integer',
        ];
    }

    /**
     * Get the user associated with this device.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get diagnoses from this device.
     */
    public function diagnoses(): HasMany
    {
        return $this->hasMany(Diagnosis::class);
    }

    /**
     * Check if device has free diagnoses remaining.
     */
    public function hasFreeDiagnosesRemaining(): bool
    {
        $freeLimit = config('app.free_diagnoses_for_guests', 3);
        return $this->diagnoses_used < $freeLimit;
    }

    /**
     * Increment diagnoses used count.
     */
    public function incrementDiagnosesUsed(): void
    {
        $this->increment('diagnoses_used');
    }
}
