<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('presence-store', function ($user) {
    return [
        'id' => $user->id, 
        'name' => 'Visitante ' . strtoupper(substr($user->id, 0, 4)),
        'url' => $user->current_url ?? null
    ];
});
