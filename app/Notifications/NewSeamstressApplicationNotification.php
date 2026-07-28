<?php

namespace App\Notifications;

use App\Models\SeamstressApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;
use NotificationChannels\WebPush\WebPushMessage;

class NewSeamstressApplicationNotification extends Notification
{
    use Queueable;

    public $application;

    public function __construct(SeamstressApplication $application)
    {
        $this->application = $application;
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast', WebPushChannel::class];
    }

    public function toWebPush($notifiable, $notification): WebPushMessage
    {
        return (new WebPushMessage())
            ->title('🧵 Nueva Postulación de Costurera')
            ->body($this->application->name . ' se postuló desde ' . $this->application->location)
            ->icon('/android-chrome-192x192.png')
            ->tag('seamstress-' . $this->application->id)
            ->data(['url' => '/seamstress-applications/' . $this->application->id]);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title'                      => 'Nueva Postulación de Costurera',
            'message'                    => $this->application->name . ' se postuló desde ' . $this->application->location,
            'seamstress_application_id'  => $this->application->id,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
