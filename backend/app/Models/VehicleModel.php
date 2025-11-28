<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class VehicleModel extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_make_id',
        'name',
        'slug',
        'type',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->slug)) {
                $model->slug = Str::slug($model->name);
            }
        });
    }

    /**
     * Get the make of this model.
     */
    public function make(): BelongsTo
    {
        return $this->belongsTo(VehicleMake::class, 'vehicle_make_id');
    }

    /**
     * Get vehicles of this model.
     */
    public function vehicles(): HasMany
    {
        return $this->hasMany(Vehicle::class);
    }

    /**
     * Get the full name (Make + Model).
     */
    public function getFullNameAttribute(): string
    {
        return "{$this->make->name} {$this->name}";
    }

    /**
     * Scope to only active models.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
