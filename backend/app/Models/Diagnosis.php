<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Diagnosis extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'user_id',
        'vehicle_id',
        'device_fingerprint_id',
        'input_type',
        'symptoms_description',
        'voice_file',
        'voice_duration',
        'voice_transcription',
        'ai_provider',
        'ai_model',
        'ai_diagnosis',
        'ai_possible_causes',
        'ai_recommended_actions',
        'ai_urgency_level',
        'ai_confidence_score',
        'ai_full_response',
        'status',
        'error_message',
        'is_free',
        'expert_contact_unlocked',
        'region_id',
    ];

    protected function casts(): array
    {
        return [
            'voice_duration' => 'integer',
            'ai_possible_causes' => 'array',
            'ai_recommended_actions' => 'array',
            'ai_confidence_score' => 'decimal:2',
            'ai_full_response' => 'array',
            'is_free' => 'boolean',
            'expert_contact_unlocked' => 'boolean',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the user who created the diagnosis.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the vehicle.
     */
    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    /**
     * Get the device fingerprint.
     */
    public function deviceFingerprint(): BelongsTo
    {
        return $this->belongsTo(DeviceFingerprint::class);
    }

    /**
     * Get the region.
     */
    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    /**
     * Get diagnosis images.
     */
    public function images(): HasMany
    {
        return $this->hasMany(DiagnosisImage::class)->orderBy('sort_order');
    }

    /**
     * Get leads generated from this diagnosis.
     */
    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class);
    }

    /**
     * Check if diagnosis is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Check if diagnosis is pending.
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if diagnosis is processing.
     */
    public function isProcessing(): bool
    {
        return $this->status === 'processing';
    }

    /**
     * Check if diagnosis failed.
     */
    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    /**
     * Check if user can view expert contacts.
     */
    public function canViewExpertContacts(): bool
    {
        // If expert contact is already unlocked
        if ($this->expert_contact_unlocked) {
            return true;
        }

        // If user is logged in and has paid diagnosis remaining
        if ($this->user) {
            $driverProfile = $this->user->driverProfile;
            if ($driverProfile && ($driverProfile->free_diagnoses_remaining > 0 || $driverProfile->paid_diagnoses_remaining > 0)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get urgency badge color.
     */
    public function getUrgencyColorAttribute(): string
    {
        return match ($this->ai_urgency_level) {
            'critical' => 'red',
            'high' => 'orange',
            'medium' => 'yellow',
            'low' => 'green',
            default => 'gray',
        };
    }

    /**
     * Scope to completed diagnoses.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope to recent diagnoses.
     */
    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }
}
