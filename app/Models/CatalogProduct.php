<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CatalogProduct extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'price',
        'description',
        'images',
        'video_url',
        'detail_image_url',
        'product_information',
        'product_features',
        'product_design',
        'is_published',
        'inventory_product_id',
        'catalog_order',
        'views_count',
        'sales_count',
    ];

    protected $casts = [
        'images' => 'array',
        'is_published' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($model) {
            if (empty($model->slug)) {
                $model->slug = \Illuminate\Support\Str::slug($model->name);
            }
        });
    }

    public function collections()
    {
        return $this->belongsToMany(Collection::class);
    }

    public function inventoryProduct()
    {
        return $this->belongsTo(Product::class, 'inventory_product_id');
    }
}
