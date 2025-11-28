<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class DiagnosisImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'diagnosis_id',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
        'thumbnail_path',
        'ai_analysis',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    /**
     * Get the diagnosis.
     */
    public function diagnosis(): BelongsTo
    {
        return $this->belongsTo(Diagnosis::class);
    }

    /**
     * Get the full URL to the image.
     */
    public function getUrlAttribute(): string
    {
        return Storage::disk(config('filesystems.default'))->url($this->file_path);
    }

    /**
     * Get the thumbnail URL.
     */
    public function getThumbnailUrlAttribute(): ?string
    {
        if (!$this->thumbnail_path) {
            return null;
        }

        return Storage::disk(config('filesystems.default'))->url($this->thumbnail_path);
    }
}
