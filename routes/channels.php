<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('store', function ($user) {
    $isVisitor = $user instanceof \Illuminate\Auth\GenericUser;
    
    return [
        'id' => (string) $user->id, 
        'name' => $isVisitor 
            ? 'Visitante ' . strtoupper(substr((string)$user->id, 0, 4))
            : ($user->name ?? 'Admin'),
        'url' => $isVisitor ? ($user->current_url ?? '/') : 'CRM Dashboard',
        'ip' => $isVisitor ? ($user->ip_address ?? 'Desconocida') : request()->ip(),
        'device' => $isVisitor ? ($user->user_agent ?? 'Desconocido') : request()->header('User-Agent'),
        'source' => $isVisitor ? ($user->source ?? 'Orgánico / Directo') : 'N/A'
    ];
});
