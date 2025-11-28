<?php

namespace App\Jobs;

use App\Mail\OtpMail;
use App\Models\OtpCode;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendOtpJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public User $user;
    public string $otp;
    public string $purpose;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     */
    public int $backoff = 60;

    /**
     * Create a new job instance.
     */
    public function __construct(User $user, string $otp, string $purpose)
    {
        $this->user = $user;
        $this->otp = $otp;
        $this->purpose = $purpose;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $expiresInMinutes = (int) config('app.otp_expiry_minutes', 10);

        // Log the OTP being sent (for debugging in log mailer)
        Log::channel('mail')->info('Sending OTP Email', [
            'user_id' => $this->user->id,
            'email' => $this->user->email,
            'purpose' => $this->purpose,
            'otp' => $this->otp,
            'expires_in' => $expiresInMinutes . ' minutes',
        ]);

        Mail::to($this->user->email)->send(
            new OtpMail(
                $this->otp,
                $this->purpose,
                $this->user->first_name,
                $expiresInMinutes
            )
        );
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Failed to send OTP email', [
            'user_id' => $this->user->id,
            'email' => $this->user->email,
            'purpose' => $this->purpose,
            'error' => $exception->getMessage(),
        ]);
    }
}
