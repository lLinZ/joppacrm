<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    /** @use HasFactory<\Database\Factories\SupplierFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'category_id',
        'type',
        'instagram',
        'reliability',
        'wholesale_price',
        'platform',
        'last_purchase_notes',
        'notes',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
