<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Lead extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'diagnosis_id',
        'expert_id',
        'driver_id',
        'status',
        'is_free_lead',
        'viewed_at',
        'contacted_at',
        'converted_at',
        'closed_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'is_free_lead' => 'boolean',
            'viewed_at' => 'datetime',
            'contacted_at' => 'datetime',
            'converted_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the diagnosis.
     */
    public function diagnosis(): BelongsTo
    {
        return $this->belongsTo(Diagnosis::class);
    }

    /**
     * Get the expert.
     */
    public function expert(): BelongsTo
    {
        return $this->belongsTo(User::class, 'expert_id');
    }

    /**
     * Get the driver.
     */
    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    /**
     * Get lead activities.
     */
    public function activities(): HasMany
    {
        return $this->hasMany(LeadActivity::class)->orderBy('created_at', 'desc');
    }

    /**
     * Get the review for this lead.
     */
    public function review(): HasOne
    {
        return $this->hasOne(Review::class);
    }

    /**
     * Mark lead as viewed.
     */
    public function markAsViewed(): void
    {
        if (!$this->viewed_at) {
            $this->update([
                'status' => 'viewed',
                'viewed_at' => now(),
            ]);

            $this->logActivity('viewed', 'Lead was viewed');
        }
    }

    /**
     * Mark lead as contacted.
     */
    public function markAsContacted(): void
    {
        $this->update([
            'status' => 'contacted',
            'contacted_at' => now(),
        ]);

        $this->logActivity('contacted', 'Driver was contacted');
    }

    /**
     * Mark lead as converted (job completed).
     */
    public function markAsConverted(): void
    {
        $this->update([
            'status' => 'converted',
            'converted_at' => now(),
        ]);

        $this->logActivity('converted', 'Lead converted to job');

        // Update expert's jobs completed count
        if ($this->expert && $this->expert->expertProfile) {
            $this->expert->expertProfile->increment('jobs_completed');
        }
    }

    /**
     * Mark lead as closed.
     */
    public function markAsClosed(string $reason = null): void
    {
        $this->update([
            'status' => 'closed',
            'closed_at' => now(),
            'notes' => $reason ?? $this->notes,
        ]);

        $this->logActivity('closed', $reason ?? 'Lead was closed');
    }

    /**
     * Log an activity.
     */
    public function logActivity(string $type, string $description = null, array $metadata = null): LeadActivity
    {
        return $this->activities()->create([
            'user_id' => auth()->id(),
            'activity_type' => $type,
            'description' => $description,
            'metadata' => $metadata,
        ]);
    }

    /**
     * Check if lead is new.
     */
    public function isNew(): bool
    {
        return $this->status === 'new';
    }

    /**
     * Check if lead is converted.
     */
    public function isConverted(): bool
    {
        return $this->status === 'converted';
    }

    /**
     * Scope to new leads.
     */
    public function scopeNew($query)
    {
        return $query->where('status', 'new');
    }

    /**
     * Scope to active leads (not closed or expired).
     */
    public function scopeActive($query)
    {
        return $query->whereNotIn('status', ['closed', 'expired']);
    }

    /**
     * Scope for a specific expert.
     */
    public function scopeForExpert($query, int $expertId)
    {
        return $query->where('expert_id', $expertId);
    }
}
