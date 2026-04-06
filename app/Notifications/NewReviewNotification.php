<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewReviewNotification extends Notification
{
    use Queueable;

    public $review;

    /**
     * Create a new notification instance.
     */
    public function __construct($review)
    {
        $this->review = $review;
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
            'id' => $this->review->id,
            'title' => 'Nueva Reseña Recibida',
            'message' => 'Review de ' . $this->review->user_name . ' (' . $this->review->rating . ' estrellas) para ' . ($this->review->product->name ?? 'Producto'),
            'type' => 'review',
            'product_id' => $this->review->catalog_product_id,
        ];
    }

    /**
     * Get the broadcast representation of the notification.
     */
    public function toBroadcast(object $notifiable): \Illuminate\Notifications\Messages\BroadcastMessage
    {
        return new \Illuminate\Notifications\Messages\BroadcastMessage([
            'id' => $this->review->id,
            'title' => 'Nueva Reseña Recibida',
            'message' => 'Review de ' . $this->review->user_name . ' (' . $this->review->rating . ' estrellas) para ' . ($this->review->product->name ?? 'Producto'),
            'type' => 'review',
        ]);
    }
}
