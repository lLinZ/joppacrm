<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WebTrafficSession extends Model
{
    protected $fillable = [
        'visitor_id',
        'ip_address',
        'user_agent',
        'entry_url',
        'started_at',
        'last_active_at',
        'duration_seconds',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'last_active_at' => 'datetime',
    ];
}
