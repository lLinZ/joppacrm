<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\DesignRequest;
use NotificationChannels\WebPush\WebPushChannel;
use NotificationChannels\WebPush\WebPushMessage;

class NewDesignRequestNotification extends Notification
{
    use Queueable;

    public $designRequest;

    /**
     * Create a new notification instance.
     */
    public function __construct(DesignRequest $designRequest)
    {
        $this->designRequest = $designRequest;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast', WebPushChannel::class];
    }

    public function toWebPush($notifiable, $notification): WebPushMessage
    {
        return (new WebPushMessage())
            ->title('🎨 Nueva Solicitud de Diseño')
            ->body('Solicitud #' . $this->designRequest->id . ' de ' . $this->designRequest->name)
            ->icon('/android-chrome-192x192.png')
            ->tag('design-' . $this->designRequest->id)
            ->data(['url' => '/design-requests/' . $this->designRequest->id]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Nueva Solicitud de Diseño',
            'message' => 'Solicitud #' . $this->designRequest->id . ' de ' . $this->designRequest->name,
            'design_request_id' => $this->designRequest->id,
        ];
    }

    /**
     * Get the broadcast representation of the notification.
     */
    public function toBroadcast(object $notifiable): \Illuminate\Notifications\Messages\BroadcastMessage
    {
        return new \Illuminate\Notifications\Messages\BroadcastMessage([
            'title' => 'Nueva Solicitud de Diseño',
            'message' => 'Solicitud #' . $this->designRequest->id . ' de ' . $this->designRequest->name,
            'design_request_id' => $this->designRequest->id,
        ]);
    }
}
