<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    /** @use HasFactory<\Database\Factories\ProductFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'sku',
        'description',
        'style',
        'fabric_type',
        'size_s',
        'size_m',
        'size_l',
        'quantity',
        'min_stock',
        'price',
        'cost',
        'supplier_id',
        'category_id',
        'show_in_catalog',
        'images',
        'catalog_order',
        'product_information',
        'product_features',
        'product_design',
    ];

    protected $casts = [
        'images' => 'array',
        'show_in_catalog' => 'boolean',
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function collections()
    {
        return $this->belongsToMany(Collection::class);
    }
}
