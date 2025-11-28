<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'description',
        'is_public',
    ];

    protected function casts(): array
    {
        return [
            'is_public' => 'boolean',
        ];
    }

    /**
     * Get the typed value.
     */
    public function getTypedValueAttribute()
    {
        return match ($this->type) {
            'integer' => (int) $this->value,
            'boolean' => filter_var($this->value, FILTER_VALIDATE_BOOLEAN),
            'json', 'array' => json_decode($this->value, true),
            'float' => (float) $this->value,
            default => $this->value,
        };
    }

    /**
     * Set the value with proper type handling.
     */
    public function setTypedValue($value): void
    {
        if ($this->type === 'json' || $this->type === 'array') {
            $this->value = json_encode($value);
        } else {
            $this->value = (string) $value;
        }

        $this->save();

        // Clear cache
        Cache::forget("settings.{$this->key}");
    }

    /**
     * Get a setting value by key.
     */
    public static function getValue(string $key, $default = null)
    {
        return Cache::rememberForever("settings.{$key}", function () use ($key, $default) {
            $setting = static::where('key', $key)->first();
            return $setting ? $setting->typed_value : $default;
        });
    }

    /**
     * Set a setting value.
     */
    public static function setValue(string $key, $value, string $type = 'string', string $group = 'general'): self
    {
        $setting = static::updateOrCreate(
            ['key' => $key],
            [
                'value' => is_array($value) ? json_encode($value) : (string) $value,
                'type' => $type,
                'group' => $group,
            ]
        );

        Cache::forget("settings.{$key}");

        return $setting;
    }

    /**
     * Get all settings as key-value pairs.
     */
    public static function getAllSettings(): array
    {
        return static::all()->pluck('typed_value', 'key')->toArray();
    }

    /**
     * Get all public settings.
     */
    public static function getPublicSettings(): array
    {
        return static::where('is_public', true)
            ->get()
            ->pluck('typed_value', 'key')
            ->toArray();
    }

    /**
     * Scope by group.
     */
    public function scopeInGroup($query, string $group)
    {
        return $query->where('group', $group);
    }

    /**
     * Scope to public settings.
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }
}
