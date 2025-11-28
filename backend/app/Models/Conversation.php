<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'lead_id',
        'driver_id',
        'expert_id',
        'last_message_at',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'last_message_at' => 'datetime',
            'is_active' => 'boolean',
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
     * Get the lead associated with this conversation.
     */
    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    /**
     * Get the driver.
     */
    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    /**
     * Get the expert.
     */
    public function expert(): BelongsTo
    {
        return $this->belongsTo(User::class, 'expert_id');
    }

    /**
     * Get all messages in this conversation.
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderBy('created_at', 'asc');
    }

    /**
     * Get the latest message.
     */
    public function latestMessage(): HasMany
    {
        return $this->hasMany(Message::class)->latest()->limit(1);
    }

    /**
     * Get unread messages count for a user.
     */
    public function unreadCountFor(int $userId): int
    {
        return $this->messages()
            ->where('sender_id', '!=', $userId)
            ->whereNull('read_at')
            ->count();
    }

    /**
     * Mark all messages as read for a user.
     */
    public function markAsReadFor(int $userId): void
    {
        $this->messages()
            ->where('sender_id', '!=', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    /**
     * Get the other participant in the conversation.
     */
    public function getOtherParticipant(int $userId): ?User
    {
        if ($this->driver_id === $userId) {
            return $this->expert;
        }

        if ($this->expert_id === $userId) {
            return $this->driver;
        }

        return null;
    }

    /**
     * Check if a user is a participant.
     */
    public function hasParticipant(int $userId): bool
    {
        return $this->driver_id === $userId || $this->expert_id === $userId;
    }

    /**
     * Find or create a conversation between a driver and expert.
     */
    public static function findOrCreateBetween(int $driverId, int $expertId, ?int $leadId = null): self
    {
        return static::firstOrCreate(
            [
                'driver_id' => $driverId,
                'expert_id' => $expertId,
            ],
            [
                'lead_id' => $leadId,
                'is_active' => true,
            ]
        );
    }

    /**
     * Scope to conversations for a user.
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('driver_id', $userId)
            ->orWhere('expert_id', $userId);
    }

    /**
     * Scope to active conversations.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
