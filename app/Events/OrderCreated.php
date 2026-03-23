<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Order $order;

    public function __construct(Order $order)
    {
        // Load relationships so full data is sent over the socket
        $this->order = $order->load(['assignedUser', 'items']);
    }

    /**
     * Get the channels the event should broadcast on.
     * We broadcast on a general public channel that all agents listen to.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('orders'),
        ];
    }

    /**
     * The event name the frontend will listen to.
     */
    public function broadcastAs(): string
    {
        return 'order.created';
    }

    /**
     * Data payload for the event.
     */
    public function broadcastWith(): array
    {
        return [
            'order' => $this->order->toArray(),
        ];
    }
}
