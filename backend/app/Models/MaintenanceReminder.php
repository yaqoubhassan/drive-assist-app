<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class MaintenanceReminder extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'vehicle_id',
        'maintenance_type_id',
        'custom_title',
        'notes',
        'due_date',
        'due_mileage',
        'interval_km',
        'interval_months',
        'last_completed_date',
        'last_completed_mileage',
        'last_completed_cost',
        'currency',
        'status',
        'notifications_enabled',
        'notification_days',
        'snoozed_until',
        'is_recurring',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'due_mileage' => 'integer',
            'interval_km' => 'integer',
            'interval_months' => 'integer',
            'last_completed_date' => 'date',
            'last_completed_mileage' => 'integer',
            'last_completed_cost' => 'decimal:2',
            'notifications_enabled' => 'boolean',
            'notification_days' => 'array',
            'snoozed_until' => 'datetime',
            'is_recurring' => 'boolean',
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
     * Get the vehicle.
     */
    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    /**
     * Get the maintenance type.
     */
    public function maintenanceType(): BelongsTo
    {
        return $this->belongsTo(MaintenanceType::class);
    }

    /**
     * Get maintenance logs.
     */
    public function logs(): HasMany
    {
        return $this->hasMany(MaintenanceLog::class)->orderBy('completed_date', 'desc');
    }

    /**
     * Get the display title.
     */
    public function getTitleAttribute(): string
    {
        return $this->custom_title ?? $this->maintenanceType->name;
    }

    /**
     * Check if reminder is due.
     */
    public function isDue(): bool
    {
        if ($this->due_date && $this->due_date->isPast()) {
            return true;
        }

        if ($this->due_mileage && $this->vehicle) {
            return $this->vehicle->mileage >= $this->due_mileage;
        }

        return false;
    }

    /**
     * Check if reminder is overdue.
     */
    public function isOverdue(): bool
    {
        if ($this->status === 'overdue') {
            return true;
        }

        if ($this->due_date && $this->due_date->isPast()) {
            return true;
        }

        return false;
    }

    /**
     * Check if reminder is snoozed.
     */
    public function isSnoozed(): bool
    {
        return $this->snoozed_until && $this->snoozed_until->isFuture();
    }

    /**
     * Snooze the reminder.
     */
    public function snooze(int $days = 7): void
    {
        $this->update([
            'status' => 'snoozed',
            'snoozed_until' => now()->addDays($days),
        ]);
    }

    /**
     * Mark as completed and create log.
     */
    public function markAsCompleted(array $data = []): MaintenanceLog
    {
        $log = $this->logs()->create([
            'user_id' => $this->user_id,
            'vehicle_id' => $this->vehicle_id,
            'maintenance_type_id' => $this->maintenance_type_id,
            'completed_date' => $data['completed_date'] ?? now(),
            'mileage_at_service' => $data['mileage'] ?? $this->vehicle?->mileage,
            'cost' => $data['cost'] ?? null,
            'currency' => $data['currency'] ?? $this->currency,
            'service_provider' => $data['service_provider'] ?? null,
            'notes' => $data['notes'] ?? null,
            'parts_replaced' => $data['parts_replaced'] ?? null,
        ]);

        // Update reminder with last completed info
        $this->update([
            'status' => 'completed',
            'last_completed_date' => $log->completed_date,
            'last_completed_mileage' => $log->mileage_at_service,
            'last_completed_cost' => $log->cost,
        ]);

        // If recurring, calculate next due date/mileage
        if ($this->is_recurring) {
            $this->calculateNextDue();
        }

        return $log;
    }

    /**
     * Calculate next due date/mileage for recurring reminders.
     */
    public function calculateNextDue(): void
    {
        $updates = ['status' => 'upcoming'];

        if ($this->interval_months && $this->last_completed_date) {
            $updates['due_date'] = $this->last_completed_date->copy()->addMonths($this->interval_months);
        }

        if ($this->interval_km && $this->last_completed_mileage) {
            $updates['due_mileage'] = $this->last_completed_mileage + $this->interval_km;
        }

        $this->update($updates);
    }

    /**
     * Get days until due.
     */
    public function getDaysUntilDueAttribute(): ?int
    {
        if (!$this->due_date) {
            return null;
        }

        return now()->diffInDays($this->due_date, false);
    }

    /**
     * Scope to due reminders.
     */
    public function scopeDue($query)
    {
        return $query->where('status', 'due');
    }

    /**
     * Scope to overdue reminders.
     */
    public function scopeOverdue($query)
    {
        return $query->where('status', 'overdue');
    }

    /**
     * Scope to upcoming reminders.
     */
    public function scopeUpcoming($query)
    {
        return $query->where('status', 'upcoming');
    }

    /**
     * Scope for a specific vehicle.
     */
    public function scopeForVehicle($query, int $vehicleId)
    {
        return $query->where('vehicle_id', $vehicleId);
    }
}
