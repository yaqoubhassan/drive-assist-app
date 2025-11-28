<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class KycDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'document_type',
        'document_number',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
        'status',
        'rejection_reason',
        'reviewed_by',
        'reviewed_at',
        'expiry_date',
    ];

    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
            'reviewed_at' => 'datetime',
            'expiry_date' => 'date',
        ];
    }

    /**
     * Get the user who uploaded this document.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the admin who reviewed this document.
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Get the full URL to the document.
     */
    public function getUrlAttribute(): string
    {
        return Storage::disk(config('filesystems.default'))->url($this->file_path);
    }

    /**
     * Check if document is approved.
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Check if document is pending.
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if document is rejected.
     */
    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    /**
     * Check if document is expired.
     */
    public function isExpired(): bool
    {
        return $this->expiry_date && $this->expiry_date->isPast();
    }

    /**
     * Get human-readable document type.
     */
    public function getDocumentTypeLabelAttribute(): string
    {
        return match ($this->document_type) {
            'national_id' => 'National ID (Ghana Card)',
            'passport' => 'Passport',
            'drivers_license' => "Driver's License",
            'voter_id' => "Voter's ID",
            'business_registration' => 'Business Registration',
            'tax_clearance' => 'Tax Clearance Certificate',
            'professional_certificate' => 'Professional Certificate',
            'proof_of_address' => 'Proof of Address',
            'selfie' => 'Selfie with ID',
            default => 'Other Document',
        };
    }

    /**
     * Scope to only pending documents.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope to only approved documents.
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }
}
