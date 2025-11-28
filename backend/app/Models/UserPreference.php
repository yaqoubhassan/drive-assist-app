<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPreference extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'language',
        'region',
        'currency',
        'distance_unit',
        'push_notifications',
        'email_notifications',
        'sms_notifications',
        'maintenance_reminders',
        'marketing_emails',
        'theme',
    ];

    protected function casts(): array
    {
        return [
            'push_notifications' => 'boolean',
            'email_notifications' => 'boolean',
            'sms_notifications' => 'boolean',
            'maintenance_reminders' => 'boolean',
            'marketing_emails' => 'boolean',
        ];
    }

    /**
     * Get the user.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Create default preferences for a user.
     */
    public static function createDefaults(User $user): self
    {
        return static::create([
            'user_id' => $user->id,
            'language' => 'en',
            'region' => 'GH',
            'currency' => 'GHS',
            'distance_unit' => 'km',
            'push_notifications' => true,
            'email_notifications' => true,
            'sms_notifications' => false,
            'maintenance_reminders' => true,
            'marketing_emails' => false,
            'theme' => 'system',
        ]);
    }
}
