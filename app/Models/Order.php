<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\OrderItem;

class Order extends Model
{
    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'total_amount',
        'status',
        'assigned_user_id',
        'call_count',
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function assignedUser()
    {
        return $this->belongsTo(\App\Models\User::class, 'assigned_user_id');
    }

    public function comments()
    {
        return $this->hasMany(OrderComment::class);
    }

    public function activities()
    {
        return $this->hasMany(OrderActivity::class);
    }
}
