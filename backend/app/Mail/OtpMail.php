<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public string $otp;
    public string $purpose;
    public string $userName;
    public int $expiresInMinutes;

    /**
     * Create a new message instance.
     */
    public function __construct(string $otp, string $purpose, string $userName, int $expiresInMinutes = 10)
    {
        $this->otp = $otp;
        $this->purpose = $purpose;
        $this->userName = $userName;
        $this->expiresInMinutes = $expiresInMinutes;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subjects = [
            'email_verification' => 'Verify Your Email - DriveAssist',
            'password_reset' => 'Reset Your Password - DriveAssist',
            'phone_verification' => 'Verify Your Phone - DriveAssist',
            'login' => 'Your Login Code - DriveAssist',
        ];

        return new Envelope(
            subject: $subjects[$this->purpose] ?? 'Your OTP Code - DriveAssist',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.otp',
            with: [
                'otp' => $this->otp,
                'purpose' => $this->purpose,
                'userName' => $this->userName,
                'expiresInMinutes' => $this->expiresInMinutes,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
