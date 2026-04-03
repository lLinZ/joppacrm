<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderCost extends Model
{
    protected $fillable = [
        'order_id',
        'revenue',
        'base_cost',
        'print_cost',
        'logistics_cost',
        'delivery_cost',
        'other_costs',
        'total_cost',
        'net_profit',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
