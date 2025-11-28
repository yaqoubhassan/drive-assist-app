<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenanceLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'maintenance_reminder_id',
        'user_id',
        'vehicle_id',
        'maintenance_type_id',
        'completed_date',
        'mileage_at_service',
        'cost',
        'currency',
        'service_provider',
        'notes',
        'parts_replaced',
    ];

    protected function casts(): array
    {
        return [
            'completed_date' => 'date',
            'mileage_at_service' => 'integer',
            'cost' => 'decimal:2',
            'parts_replaced' => 'array',
        ];
    }

    /**
     * Get the reminder.
     */
    public function reminder(): BelongsTo
    {
        return $this->belongsTo(MaintenanceReminder::class, 'maintenance_reminder_id');
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
     * Get formatted cost.
     */
    public function getFormattedCostAttribute(): ?string
    {
        if (!$this->cost) {
            return null;
        }

        return $this->currency . ' ' . number_format($this->cost, 2);
    }
}
