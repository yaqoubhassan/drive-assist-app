<?php

namespace App\Events;

use App\Models\Diagnosis;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DiagnosisUpdatedEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Diagnosis $diagnosis;
    public string $updateType;

    /**
     * Create a new event instance.
     */
    public function __construct(Diagnosis $diagnosis, string $updateType = 'status_changed')
    {
        $this->diagnosis = $diagnosis;
        $this->updateType = $updateType;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        $channels = [];

        // Broadcast to the user who created the diagnosis
        if ($this->diagnosis->user_id) {
            $channels[] = new PrivateChannel('user.' . $this->diagnosis->user_id);
        }

        // Broadcast to the diagnosis channel for real-time updates
        $channels[] = new PrivateChannel('diagnosis.' . $this->diagnosis->id);

        return $channels;
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'diagnosis.updated';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->diagnosis->id,
            'uuid' => $this->diagnosis->uuid,
            'status' => $this->diagnosis->status,
            'update_type' => $this->updateType,
            'summary' => $this->diagnosis->summary,
            'severity' => $this->diagnosis->severity,
            'possible_causes' => $this->diagnosis->possible_causes,
            'recommended_actions' => $this->diagnosis->recommended_actions,
            'updated_at' => $this->diagnosis->updated_at->toIso8601String(),
        ];
    }
}
