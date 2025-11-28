<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Media extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'mediable_type',
        'mediable_id',
        'collection',
        'file_name',
        'file_path',
        'disk',
        'mime_type',
        'size',
        'custom_properties',
        'responsive_images',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'size' => 'integer',
            'custom_properties' => 'array',
            'responsive_images' => 'array',
            'sort_order' => 'integer',
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

        static::deleting(function ($model) {
            // Delete the actual file when model is deleted
            Storage::disk($model->disk)->delete($model->file_path);
        });
    }

    /**
     * Get the owning mediable model.
     */
    public function mediable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the full URL to the media.
     */
    public function getUrlAttribute(): string
    {
        return Storage::disk($this->disk)->url($this->file_path);
    }

    /**
     * Get the temporary URL (for private storage).
     */
    public function getTemporaryUrl(int $minutes = 60): string
    {
        return Storage::disk($this->disk)->temporaryUrl(
            $this->file_path,
            now()->addMinutes($minutes)
        );
    }

    /**
     * Get human-readable file size.
     */
    public function getHumanReadableSizeAttribute(): string
    {
        $bytes = $this->size;
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * Check if media is an image.
     */
    public function isImage(): bool
    {
        return str_starts_with($this->mime_type, 'image/');
    }

    /**
     * Check if media is a video.
     */
    public function isVideo(): bool
    {
        return str_starts_with($this->mime_type, 'video/');
    }

    /**
     * Check if media is a document.
     */
    public function isDocument(): bool
    {
        return in_array($this->mime_type, [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    /**
     * Scope by collection.
     */
    public function scopeInCollection($query, string $collection)
    {
        return $query->where('collection', $collection);
    }
}
