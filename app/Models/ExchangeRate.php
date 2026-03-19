<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExchangeRate extends Model
{
    protected $fillable = [
        'currency',
        'rate',
    ];

    protected $casts = [
        'rate' => 'decimal:4',
    ];

    public function histories()
    {
        return $this->hasMany(ExchangeRateHistory::class);
    }
}
