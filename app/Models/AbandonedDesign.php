<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AbandonedDesign extends Model
{
    protected $fillable = [
        'session_id',
        'ip_address',
        'duration_seconds',
        'design_data',
        'status',
        'last_active_at',
    ];

    protected $casts = [
        'design_data' => 'array',
        'last_active_at' => 'datetime',
    ];
}
