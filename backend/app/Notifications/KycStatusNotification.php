<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class KycStatusNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public string $status;
    public ?string $rejectionReason;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $status, ?string $rejectionReason = null)
    {
        $this->status = $status;
        $this->rejectionReason = $rejectionReason;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject('KYC Verification Update - DriveAssist')
            ->greeting('Hello ' . $notifiable->first_name . '!');

        if ($this->status === 'approved') {
            $mail->line('Congratulations! Your KYC verification has been approved.')
                ->line('You now have full access to all expert features on DriveAssist.')
                ->line('You have been credited with 4 free leads to get started!')
                ->action('Start Receiving Leads', url('/expert/dashboard'))
                ->line('Thank you for completing your verification.');
        } elseif ($this->status === 'rejected') {
            $mail->line('Unfortunately, your KYC verification has been rejected.')
                ->line('**Reason:** ' . ($this->rejectionReason ?? 'Documents did not meet requirements'))
                ->line('Please review the requirements and resubmit your documents.')
                ->action('Resubmit Documents', url('/expert/kyc'))
                ->line('If you have any questions, please contact our support team.');
        } else {
            $mail->line('Your KYC documents are currently being reviewed.')
                ->line('We will notify you once the review is complete.')
                ->line('This usually takes 1-2 business days.');
        }

        return $mail->salutation('Best regards, The DriveAssist Team');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'kyc_status',
            'status' => $this->status,
            'message' => $this->status === 'approved'
                ? 'Your KYC verification has been approved!'
                : ($this->status === 'rejected'
                    ? 'Your KYC verification was rejected'
                    : 'Your KYC documents are under review'),
            'rejection_reason' => $this->rejectionReason,
        ];
    }
}
