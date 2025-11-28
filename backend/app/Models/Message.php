<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Message extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'conversation_id',
        'sender_id',
        'content',
        'type',
        'metadata',
        'read_at',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'read_at' => 'datetime',
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

        static::created(function ($model) {
            // Update conversation's last_message_at
            $model->conversation->update(['last_message_at' => $model->created_at]);
        });
    }

    /**
     * Get the conversation.
     */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    /**
     * Get the sender.
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Check if message is read.
     */
    public function isRead(): bool
    {
        return $this->read_at !== null;
    }

    /**
     * Mark message as read.
     */
    public function markAsRead(): void
    {
        if (!$this->read_at) {
            $this->update(['read_at' => now()]);
        }
    }

    /**
     * Check if this is the sender.
     */
    public function isSentBy(int $userId): bool
    {
        return $this->sender_id === $userId;
    }

    /**
     * Get formatted content based on type.
     */
    public function getFormattedContentAttribute(): string
    {
        return match ($this->type) {
            'image' => '[Image]',
            'voice' => '[Voice message]',
            'location' => '[Location]',
            'system' => $this->content,
            default => $this->content,
        };
    }

    /**
     * Get image URL if type is image.
     */
    public function getImageUrlAttribute(): ?string
    {
        if ($this->type === 'image' && isset($this->metadata['url'])) {
            return $this->metadata['url'];
        }

        return null;
    }

    /**
     * Get voice URL if type is voice.
     */
    public function getVoiceUrlAttribute(): ?string
    {
        if ($this->type === 'voice' && isset($this->metadata['url'])) {
            return $this->metadata['url'];
        }

        return null;
    }

    /**
     * Get location coordinates if type is location.
     */
    public function getLocationAttribute(): ?array
    {
        if ($this->type === 'location' && isset($this->metadata['latitude'], $this->metadata['longitude'])) {
            return [
                'latitude' => $this->metadata['latitude'],
                'longitude' => $this->metadata['longitude'],
                'address' => $this->metadata['address'] ?? null,
            ];
        }

        return null;
    }

    /**
     * Scope to unread messages.
     */
    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    /**
     * Scope to messages not sent by a user.
     */
    public function scopeNotSentBy($query, int $userId)
    {
        return $query->where('sender_id', '!=', $userId);
    }
}
