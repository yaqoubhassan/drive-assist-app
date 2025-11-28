<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Region extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'country',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get experts in this region.
     */
    public function experts(): BelongsToMany
    {
        return $this->belongsToMany(ExpertProfile::class, 'expert_regions');
    }

    /**
     * Get driver profiles in this region.
     */
    public function driverProfiles(): HasMany
    {
        return $this->hasMany(DriverProfile::class);
    }

    /**
     * Get diagnoses in this region.
     */
    public function diagnoses(): HasMany
    {
        return $this->hasMany(Diagnosis::class);
    }

    /**
     * Scope to only active regions.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
