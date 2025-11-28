<?php

namespace App\Events;

use App\Models\Lead;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewLeadEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Lead $lead;

    /**
     * Create a new event instance.
     */
    public function __construct(Lead $lead)
    {
        $this->lead = $lead->load(['diagnosis', 'driver']);
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('expert.' . $this->lead->expert_id),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'lead.new';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->lead->id,
            'uuid' => $this->lead->uuid,
            'status' => $this->lead->status,
            'is_free_lead' => $this->lead->is_free_lead,
            'diagnosis' => $this->lead->diagnosis ? [
                'id' => $this->lead->diagnosis->id,
                'uuid' => $this->lead->diagnosis->uuid,
                'summary' => $this->lead->diagnosis->summary,
                'severity' => $this->lead->diagnosis->severity,
                'vehicle_info' => $this->lead->diagnosis->vehicle_info,
            ] : null,
            'driver' => $this->lead->driver ? [
                'id' => $this->lead->driver->id,
                'first_name' => $this->lead->driver->first_name,
                'city' => $this->lead->driver->driverProfile?->city,
            ] : null,
            'created_at' => $this->lead->created_at->toIso8601String(),
        ];
    }
}
