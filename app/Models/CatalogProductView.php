<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CatalogProductView extends Model
{
    use HasFactory;

    protected $fillable = [
        'catalog_product_id',
        'visitor_id',
        'ip_address',
    ];

    public function catalogProduct()
    {
        return $this->belongsTo(CatalogProduct::class);
    }
}
