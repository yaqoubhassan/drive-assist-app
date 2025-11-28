<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ExpertProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'business_name',
        'bio',
        'experience_years',
        'region_id',
        'city',
        'address',
        'latitude',
        'longitude',
        'whatsapp_number',
        'alternate_phone',
        'kyc_status',
        'kyc_submitted_at',
        'kyc_approved_at',
        'kyc_rejection_reason',
        'free_leads_remaining',
        'total_leads_received',
        'rating',
        'rating_count',
        'jobs_completed',
        'is_priority_listed',
        'is_available',
        'working_hours',
    ];

    protected function casts(): array
    {
        return [
            'experience_years' => 'integer',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
            'kyc_submitted_at' => 'datetime',
            'kyc_approved_at' => 'datetime',
            'free_leads_remaining' => 'integer',
            'total_leads_received' => 'integer',
            'rating' => 'decimal:2',
            'rating_count' => 'integer',
            'jobs_completed' => 'integer',
            'is_priority_listed' => 'boolean',
            'is_available' => 'boolean',
            'working_hours' => 'array',
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
     * Get specializations.
     */
    public function specializations(): BelongsToMany
    {
        return $this->belongsToMany(Specialization::class, 'expert_specializations');
    }

    /**
     * Get service regions.
     */
    public function serviceRegions(): BelongsToMany
    {
        return $this->belongsToMany(Region::class, 'expert_regions');
    }

    /**
     * Get vehicle makes the expert specializes in.
     */
    public function vehicleMakes(): BelongsToMany
    {
        return $this->belongsToMany(VehicleMake::class, 'expert_vehicle_makes');
    }

    /**
     * Check if KYC is approved.
     */
    public function isKycApproved(): bool
    {
        return $this->kyc_status === 'approved';
    }

    /**
     * Check if KYC is pending.
     */
    public function isKycPending(): bool
    {
        return $this->kyc_status === 'pending';
    }

    /**
     * Check if KYC is submitted and waiting for review.
     */
    public function isKycSubmitted(): bool
    {
        return $this->kyc_status === 'submitted';
    }

    /**
     * Check if expert has free leads remaining.
     */
    public function hasFreeleadsRemaining(): bool
    {
        return $this->free_leads_remaining > 0;
    }

    /**
     * Decrement free leads.
     */
    public function decrementFreeLeads(): void
    {
        if ($this->free_leads_remaining > 0) {
            $this->decrement('free_leads_remaining');
        }
    }

    /**
     * Increment total leads received.
     */
    public function incrementTotalLeads(): void
    {
        $this->increment('total_leads_received');
    }

    /**
     * Update rating based on new review.
     */
    public function updateRating(int $newRating): void
    {
        $totalRating = ($this->rating * $this->rating_count) + $newRating;
        $this->rating_count++;
        $this->rating = $totalRating / $this->rating_count;
        $this->save();
    }

    /**
     * Scope to only available experts.
     */
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    /**
     * Scope to only KYC approved experts.
     */
    public function scopeKycApproved($query)
    {
        return $query->where('kyc_status', 'approved');
    }

    /**
     * Scope to priority listed experts.
     */
    public function scopePriorityListed($query)
    {
        return $query->where('is_priority_listed', true);
    }
}
