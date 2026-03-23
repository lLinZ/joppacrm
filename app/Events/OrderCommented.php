<?php

namespace App\Events;

use App\Models\OrderComment;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderCommented implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public OrderComment $comment;

    public function __construct(OrderComment $comment)
    {
        $this->comment = $comment->load('user');
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('orders.' . $this->comment->order_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'order.commented';
    }

    public function broadcastWith(): array
    {
        return [
            'comment' => $this->comment->toArray(),
            'order_id' => $this->comment->order_id,
        ];
    }
}
