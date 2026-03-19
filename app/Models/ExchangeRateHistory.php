<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExchangeRateHistory extends Model
{
    protected $fillable = ['exchange_rate_id', 'rate'];

    public function exchangeRate()
    {
        return $this->belongsTo(ExchangeRate::class);
    }
}
