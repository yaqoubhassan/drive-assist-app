<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'password',
        'role',
        'avatar',
        'onboarding_completed',
        'is_active',
        'fcm_token',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'password' => 'hashed',
            'onboarding_completed' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the user's full name.
     */
    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    /**
     * Check if user is a driver
     */
    public function isDriver(): bool
    {
        return $this->role === 'driver';
    }

    /**
     * Check if user is an expert
     */
    public function isExpert(): bool
    {
        return $this->role === 'expert';
    }

    /**
     * Check if user is an admin
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is a guest
     */
    public function isGuest(): bool
    {
        return $this->role === 'guest';
    }

    /**
     * Get the expert profile for this user.
     */
    public function expertProfile(): HasOne
    {
        return $this->hasOne(ExpertProfile::class);
    }

    /**
     * Get the driver profile for this user.
     */
    public function driverProfile(): HasOne
    {
        return $this->hasOne(DriverProfile::class);
    }

    /**
     * Get user preferences.
     */
    public function preferences(): HasOne
    {
        return $this->hasOne(UserPreference::class);
    }

    /**
     * Get the vehicles owned by the user.
     */
    public function vehicles(): HasMany
    {
        return $this->hasMany(Vehicle::class);
    }

    /**
     * Get the diagnoses created by the user.
     */
    public function diagnoses(): HasMany
    {
        return $this->hasMany(Diagnosis::class);
    }

    /**
     * Get the KYC documents for this user.
     */
    public function kycDocuments(): HasMany
    {
        return $this->hasMany(KycDocument::class);
    }

    /**
     * Get the leads assigned to this expert.
     */
    public function leadsAsExpert(): HasMany
    {
        return $this->hasMany(Lead::class, 'expert_id');
    }

    /**
     * Get the leads created by this driver.
     */
    public function leadsAsDriver(): HasMany
    {
        return $this->hasMany(Lead::class, 'driver_id');
    }

    /**
     * Get the expert subscriptions.
     */
    public function expertSubscriptions(): HasMany
    {
        return $this->hasMany(ExpertSubscription::class);
    }

    /**
     * Get the current active subscription.
     */
    public function activeSubscription(): HasOne
    {
        return $this->hasOne(ExpertSubscription::class)
            ->where('status', 'active')
            ->latest();
    }

    /**
     * Get lead package purchases.
     */
    public function leadPackagePurchases(): HasMany
    {
        return $this->hasMany(LeadPackagePurchase::class);
    }

    /**
     * Get diagnosis package purchases.
     */
    public function diagnosisPackagePurchases(): HasMany
    {
        return $this->hasMany(DiagnosisPackagePurchase::class);
    }

    /**
     * Get the payments made by the user.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Get maintenance reminders.
     */
    public function maintenanceReminders(): HasMany
    {
        return $this->hasMany(MaintenanceReminder::class);
    }

    /**
     * Get quiz attempts.
     */
    public function quizAttempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class);
    }

    /**
     * Get reviews given by this user (as driver).
     */
    public function reviewsGiven(): HasMany
    {
        return $this->hasMany(Review::class, 'driver_id');
    }

    /**
     * Get reviews received by this user (as expert).
     */
    public function reviewsReceived(): HasMany
    {
        return $this->hasMany(Review::class, 'expert_id');
    }

    /**
     * Get device fingerprints associated with this user.
     */
    public function deviceFingerprints(): HasMany
    {
        return $this->hasMany(DeviceFingerprint::class);
    }

    /**
     * Check if user has completed KYC (for experts).
     */
    public function hasCompletedKyc(): bool
    {
        if (!$this->isExpert()) {
            return true;
        }

        return $this->expertProfile?->kyc_status === 'approved';
    }

    /**
     * Get the primary vehicle.
     */
    public function primaryVehicle(): HasOne
    {
        return $this->hasOne(Vehicle::class)->where('is_primary', true);
    }
}
