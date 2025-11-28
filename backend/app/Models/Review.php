<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'lead_id',
        'expert_id',
        'driver_id',
        'rating',
        'comment',
        'expert_response',
        'expert_responded_at',
        'is_visible',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'expert_responded_at' => 'datetime',
            'is_visible' => 'boolean',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::created(function ($review) {
            // Update expert's rating
            if ($review->expert && $review->expert->expertProfile) {
                $review->expert->expertProfile->updateRating($review->rating);
            }
        });
    }

    /**
     * Get the lead.
     */
    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
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
     * Add expert response.
     */
    public function addExpertResponse(string $response): void
    {
        $this->update([
            'expert_response' => $response,
            'expert_responded_at' => now(),
        ]);
    }

    /**
     * Get rating stars.
     */
    public function getRatingStarsAttribute(): string
    {
        return str_repeat('★', $this->rating) . str_repeat('☆', 5 - $this->rating);
    }

    /**
     * Scope to visible reviews.
     */
    public function scopeVisible($query)
    {
        return $query->where('is_visible', true);
    }

    /**
     * Scope for a specific expert.
     */
    public function scopeForExpert($query, int $expertId)
    {
        return $query->where('expert_id', $expertId);
    }
}
