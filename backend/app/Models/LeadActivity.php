<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeadActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'lead_id',
        'user_id',
        'activity_type',
        'description',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }

    /**
     * Get the lead.
     */
    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    /**
     * Get the user who performed the activity.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get activity type label.
     */
    public function getActivityTypeLabelAttribute(): string
    {
        return match ($this->activity_type) {
            'viewed' => 'Viewed',
            'contacted' => 'Contacted',
            'called' => 'Called',
            'messaged' => 'Sent Message',
            'converted' => 'Converted',
            'closed' => 'Closed',
            default => ucfirst($this->activity_type),
        };
    }
}
