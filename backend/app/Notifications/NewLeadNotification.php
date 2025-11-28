<?php

namespace App\Notifications;

use App\Models\Lead;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewLeadNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public Lead $lead;

    /**
     * Create a new notification instance.
     */
    public function __construct(Lead $lead)
    {
        $this->lead = $lead;
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
        $diagnosis = $this->lead->diagnosis;
        $driver = $diagnosis->user;

        return (new MailMessage)
            ->subject('New Lead Available - DriveAssist')
            ->greeting('Hello ' . $notifiable->first_name . '!')
            ->line('You have received a new lead from a driver looking for assistance.')
            ->line('**Issue:** ' . \Str::limit($diagnosis->symptoms, 100))
            ->line('**Vehicle:** ' . ($diagnosis->vehicle?->make?->name ?? 'Not specified') . ' ' . ($diagnosis->vehicle?->model?->name ?? ''))
            ->line('**Location:** ' . ($driver->driverProfile?->city ?? 'Not specified'))
            ->action('View Lead Details', url('/expert/leads/' . $this->lead->id))
            ->line('Act fast! This lead is also available to other experts in your area.')
            ->salutation('Best regards, The DriveAssist Team');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'new_lead',
            'lead_id' => $this->lead->id,
            'diagnosis_id' => $this->lead->diagnosis_id,
            'message' => 'You have received a new lead',
            'symptoms_preview' => \Str::limit($this->lead->diagnosis->symptoms, 50),
        ];
    }
}
