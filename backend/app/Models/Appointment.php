<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'driver_id',
        'expert_id',
        'diagnosis_id',
        'vehicle_id',
        'scheduled_date',
        'scheduled_time',
        'estimated_duration_minutes',
        'service_type',
        'description',
        'notes',
        'location_type',
        'address',
        'latitude',
        'longitude',
        'status',
        'estimated_cost',
        'final_cost',
        'currency',
        'payment_status',
        'payment_method',
        'confirmed_at',
        'started_at',
        'completed_at',
        'cancelled_at',
        'cancellation_reason',
        'cancelled_by',
    ];

    protected $casts = [
        'scheduled_date' => 'date',
        'scheduled_time' => 'datetime:H:i',
        'estimated_duration_minutes' => 'integer',
        'estimated_cost' => 'decimal:2',
        'final_cost' => 'decimal:2',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'confirmed_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    // Status constants
    const STATUS_PENDING = 'pending';
    const STATUS_CONFIRMED = 'confirmed';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_NO_SHOW = 'no_show';
    const STATUS_REJECTED = 'rejected';

    // Service types
    const TYPE_DIAGNOSTIC = 'diagnostic';
    const TYPE_REPAIR = 'repair';
    const TYPE_MAINTENANCE = 'maintenance';
    const TYPE_INSPECTION = 'inspection';

    /**
     * Get the driver who booked this appointment.
     */
    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    /**
     * Get the expert providing the service.
     */
    public function expert(): BelongsTo
    {
        return $this->belongsTo(User::class, 'expert_id');
    }

    /**
     * Get the expert's profile.
     */
    public function expertProfile(): BelongsTo
    {
        return $this->belongsTo(ExpertProfile::class, 'expert_id', 'user_id');
    }

    /**
     * Get the associated diagnosis if any.
     */
    public function diagnosis(): BelongsTo
    {
        return $this->belongsTo(Diagnosis::class);
    }

    /**
     * Get the vehicle for this appointment.
     */
    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    /**
     * Get the services included in this appointment.
     */
    public function services(): HasMany
    {
        return $this->hasMany(AppointmentService::class);
    }

    /**
     * Get the review for this appointment.
     */
    public function review(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Scope for pending appointments.
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope for confirmed appointments.
     */
    public function scopeConfirmed($query)
    {
        return $query->where('status', self::STATUS_CONFIRMED);
    }

    /**
     * Scope for active appointments (pending or confirmed).
     */
    public function scopeActive($query)
    {
        return $query->whereIn('status', [self::STATUS_PENDING, self::STATUS_CONFIRMED, self::STATUS_IN_PROGRESS]);
    }

    /**
     * Scope for upcoming appointments.
     */
    public function scopeUpcoming($query)
    {
        return $query->where('scheduled_date', '>=', now()->toDateString())
            ->whereIn('status', [self::STATUS_PENDING, self::STATUS_CONFIRMED]);
    }

    /**
     * Scope for past appointments.
     */
    public function scopePast($query)
    {
        return $query->where(function ($q) {
            $q->where('scheduled_date', '<', now()->toDateString())
                ->orWhereIn('status', [self::STATUS_COMPLETED, self::STATUS_CANCELLED, self::STATUS_NO_SHOW]);
        });
    }

    /**
     * Scope for driver's appointments.
     */
    public function scopeForDriver($query, $driverId)
    {
        return $query->where('driver_id', $driverId);
    }

    /**
     * Scope for expert's appointments.
     */
    public function scopeForExpert($query, $expertId)
    {
        return $query->where('expert_id', $expertId);
    }

    /**
     * Check if appointment can be cancelled.
     */
    public function canBeCancelled(): bool
    {
        return in_array($this->status, [self::STATUS_PENDING, self::STATUS_CONFIRMED]);
    }

    /**
     * Check if appointment can be confirmed by expert.
     */
    public function canBeConfirmed(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if appointment can be started.
     */
    public function canBeStarted(): bool
    {
        return $this->status === self::STATUS_CONFIRMED;
    }

    /**
     * Check if appointment can be completed.
     */
    public function canBeCompleted(): bool
    {
        return $this->status === self::STATUS_IN_PROGRESS;
    }

    /**
     * Confirm the appointment.
     */
    public function confirm(): bool
    {
        if (!$this->canBeConfirmed()) {
            return false;
        }

        $this->update([
            'status' => self::STATUS_CONFIRMED,
            'confirmed_at' => now(),
        ]);

        return true;
    }

    /**
     * Start the appointment.
     */
    public function start(): bool
    {
        if (!$this->canBeStarted()) {
            return false;
        }

        $this->update([
            'status' => self::STATUS_IN_PROGRESS,
            'started_at' => now(),
        ]);

        return true;
    }

    /**
     * Complete the appointment.
     */
    public function complete(?float $finalCost = null): bool
    {
        if (!$this->canBeCompleted()) {
            return false;
        }

        $this->update([
            'status' => self::STATUS_COMPLETED,
            'completed_at' => now(),
            'final_cost' => $finalCost ?? $this->estimated_cost,
        ]);

        return true;
    }

    /**
     * Cancel the appointment.
     */
    public function cancel(string $reason, string $cancelledBy): bool
    {
        if (!$this->canBeCancelled()) {
            return false;
        }

        $this->update([
            'status' => self::STATUS_CANCELLED,
            'cancelled_at' => now(),
            'cancellation_reason' => $reason,
            'cancelled_by' => $cancelledBy,
        ]);

        return true;
    }

    /**
     * Reject the appointment (expert only).
     */
    public function reject(string $reason): bool
    {
        if ($this->status !== self::STATUS_PENDING) {
            return false;
        }

        $this->update([
            'status' => self::STATUS_REJECTED,
            'cancelled_at' => now(),
            'cancellation_reason' => $reason,
            'cancelled_by' => 'expert',
        ]);

        return true;
    }

    /**
     * Get the full scheduled datetime.
     */
    public function getScheduledDateTimeAttribute(): Carbon
    {
        return Carbon::parse($this->scheduled_date->format('Y-m-d') . ' ' . $this->scheduled_time->format('H:i:s'));
    }

    /**
     * Get the end time of appointment.
     */
    public function getEndTimeAttribute(): Carbon
    {
        return $this->scheduled_date_time->copy()->addMinutes($this->estimated_duration_minutes);
    }

    /**
     * Calculate total service cost.
     */
    public function calculateTotalCost(): float
    {
        return $this->services->sum(function ($service) {
            return $service->price * $service->quantity;
        });
    }
}
