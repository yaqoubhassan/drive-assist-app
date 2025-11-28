<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OtpCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'identifier',
        'type',
        'code',
        'expires_at',
        'verified_at',
        'attempts',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'verified_at' => 'datetime',
            'attempts' => 'integer',
        ];
    }

    /**
     * Generate a new OTP code.
     */
    public static function generate(string $identifier, string $type, int $length = 6, int $expiresInMinutes = 15): self
    {
        // Invalidate any existing OTPs for this identifier and type
        static::where('identifier', $identifier)
            ->where('type', $type)
            ->whereNull('verified_at')
            ->delete();

        // Generate new OTP
        $code = str_pad(random_int(0, pow(10, $length) - 1), $length, '0', STR_PAD_LEFT);

        return static::create([
            'identifier' => $identifier,
            'type' => $type,
            'code' => $code,
            'expires_at' => now()->addMinutes($expiresInMinutes),
        ]);
    }

    /**
     * Verify an OTP code.
     */
    public static function verify(string $identifier, string $type, string $code): bool
    {
        $otp = static::where('identifier', $identifier)
            ->where('type', $type)
            ->whereNull('verified_at')
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if (!$otp) {
            return false;
        }

        // Check max attempts
        if ($otp->attempts >= 5) {
            return false;
        }

        // Increment attempts
        $otp->increment('attempts');

        // Verify code
        if ($otp->code !== $code) {
            return false;
        }

        // Mark as verified
        $otp->update(['verified_at' => now()]);

        return true;
    }

    /**
     * Check if OTP is expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /**
     * Check if OTP is verified.
     */
    public function isVerified(): bool
    {
        return $this->verified_at !== null;
    }

    /**
     * Check if max attempts reached.
     */
    public function hasMaxAttempts(): bool
    {
        return $this->attempts >= 5;
    }
}
