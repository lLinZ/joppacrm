<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DesignRequestItem extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'design_data' => 'array',
    ];

    public function request()
    {
        return $this->belongsTo(DesignRequest::class, 'design_request_id');
    }
}
