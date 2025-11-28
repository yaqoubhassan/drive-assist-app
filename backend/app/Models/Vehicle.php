<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vehicle extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'vehicle_make_id',
        'vehicle_model_id',
        'custom_make',
        'custom_model',
        'year',
        'color',
        'license_plate',
        'vin',
        'fuel_type',
        'transmission',
        'mileage',
        'mileage_unit',
        'nickname',
        'image',
        'is_primary',
    ];

    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'mileage' => 'integer',
            'is_primary' => 'boolean',
        ];
    }

    /**
     * Get the user who owns the vehicle.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the vehicle make.
     */
    public function make(): BelongsTo
    {
        return $this->belongsTo(VehicleMake::class, 'vehicle_make_id');
    }

    /**
     * Get the vehicle model.
     */
    public function model(): BelongsTo
    {
        return $this->belongsTo(VehicleModel::class, 'vehicle_model_id');
    }

    /**
     * Get diagnoses for this vehicle.
     */
    public function diagnoses(): HasMany
    {
        return $this->hasMany(Diagnosis::class);
    }

    /**
     * Get maintenance reminders for this vehicle.
     */
    public function maintenanceReminders(): HasMany
    {
        return $this->hasMany(MaintenanceReminder::class);
    }

    /**
     * Get maintenance logs for this vehicle.
     */
    public function maintenanceLogs(): HasMany
    {
        return $this->hasMany(MaintenanceLog::class);
    }

    /**
     * Get the display name for the vehicle.
     */
    public function getDisplayNameAttribute(): string
    {
        if ($this->nickname) {
            return $this->nickname;
        }

        $makeName = $this->make?->name ?? $this->custom_make ?? 'Unknown';
        $modelName = $this->model?->name ?? $this->custom_model ?? 'Vehicle';
        $year = $this->year ? "{$this->year} " : '';

        return "{$year}{$makeName} {$modelName}";
    }

    /**
     * Get the make name (from relationship or custom).
     */
    public function getMakeNameAttribute(): string
    {
        return $this->make?->name ?? $this->custom_make ?? 'Unknown';
    }

    /**
     * Get the model name (from relationship or custom).
     */
    public function getModelNameAttribute(): string
    {
        return $this->model?->name ?? $this->custom_model ?? 'Unknown';
    }
}
