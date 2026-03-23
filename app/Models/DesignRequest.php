<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DesignRequest extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function items()
    {
        return $this->hasMany(DesignRequestItem::class);
    }

    public function comments()
    {
        return $this->hasMany(DesignRequestComment::class);
    }
}
