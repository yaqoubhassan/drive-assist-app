<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class MaintenanceType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'color',
        'default_interval_km',
        'default_interval_months',
        'is_critical',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'default_interval_km' => 'integer',
            'default_interval_months' => 'integer',
            'is_critical' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
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
     * Get reminders for this type.
     */
    public function reminders(): HasMany
    {
        return $this->hasMany(MaintenanceReminder::class);
    }

    /**
     * Get logs for this type.
     */
    public function logs(): HasMany
    {
        return $this->hasMany(MaintenanceLog::class);
    }

    /**
     * Scope to active types.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to critical types.
     */
    public function scopeCritical($query)
    {
        return $query->where('is_critical', true);
    }

    /**
     * Scope ordered by sort order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }
}
