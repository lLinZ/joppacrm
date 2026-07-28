<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use NotificationChannels\WebPush\HasPushSubscriptions;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasPushSubscriptions;

    /**
     * Cuando está definido, las notificaciones push salen sólo a este endpoint
     * (sirve para probar en el dispositivo desde el que se pulsa el botón).
     */
    protected ?string $onlyPushEndpoint = null;

    public function pushOnlyTo(?string $endpoint): static
    {
        $this->onlyPushEndpoint = $endpoint;

        return $this;
    }

    /**
     * @return \Illuminate\Database\Eloquent\Collection<array-key, \NotificationChannels\WebPush\PushSubscription>
     */
    public function routeNotificationForWebPush(): \Illuminate\Database\Eloquent\Collection
    {
        $subscriptions = $this->pushSubscriptions;

        if ($this->onlyPushEndpoint === null) {
            return $subscriptions;
        }

        return $subscriptions->where('endpoint', $this->onlyPushEndpoint)->values();
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'theme',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
