<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewOrderNotification extends Notification
{
    use Queueable;

    public $order;

    /**
     * Create a new notification instance.
     */
    public function __construct($order)
    {
        $this->order = $order;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Nueva Orden Recibida',
            'message' => 'Orden #' . $this->order->id . ' de ' . $this->order->name . ' por $' . number_format($this->order->total_amount, 2, ',', '.'),
            'order_id' => $this->order->id,
            'amount' => $this->order->total_amount,
        ];
    }

    /**
     * Get the broadcast representation of the notification.
     */
    public function toBroadcast(object $notifiable): \Illuminate\Notifications\Messages\BroadcastMessage
    {
        return new \Illuminate\Notifications\Messages\BroadcastMessage([
            'title' => 'Nueva Orden Recibida',
            'message' => 'Orden #' . $this->order->id . ' de ' . $this->order->name . ' por $' . number_format($this->order->total_amount, 2, ',', '.'),
            'order_id' => $this->order->id,
        ]);
    }
}
