<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class MaintenanceType extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
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

    /**
     * The accessors to append to the model's array form.
     */
    protected $appends = ['is_system'];

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
     * Get the user who created this custom type.
     * NULL means it's a system type.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
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

    /**
     * Scope to system types only (no user_id).
     */
    public function scopeSystem($query)
    {
        return $query->whereNull('user_id');
    }

    /**
     * Scope to custom types only (has user_id).
     */
    public function scopeCustom($query)
    {
        return $query->whereNotNull('user_id');
    }

    /**
     * Scope to types available for a specific user.
     * Returns all system types plus the user's custom types.
     */
    public function scopeForUser($query, ?int $userId)
    {
        return $query->where(function ($q) use ($userId) {
            $q->whereNull('user_id');
            if ($userId) {
                $q->orWhere('user_id', $userId);
            }
        });
    }

    /**
     * Check if this is a system-defined type.
     */
    public function getIsSystemAttribute(): bool
    {
        return $this->user_id === null;
    }

    /**
     * Check if a user can edit this type.
     */
    public function canBeEditedBy(?int $userId): bool
    {
        // System types cannot be edited
        if ($this->is_system) {
            return false;
        }

        // Custom types can only be edited by their owner
        return $this->user_id === $userId;
    }

    /**
     * Check if a user can delete this type.
     */
    public function canBeDeletedBy(?int $userId): bool
    {
        return $this->canBeEditedBy($userId);
    }
}
