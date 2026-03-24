<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('catalog_products', function (Blueprint $table) {
            $table->unsignedBigInteger('unique_views_count')->default(0)->after('views_count');
        });

        Schema::create('catalog_product_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('catalog_product_id')->constrained()->cascadeOnDelete();
            $table->string('visitor_id')->index();
            $table->string('ip_address')->nullable();
            $table->timestamps();
            
            // Un visitante solo debe contar una vez por producto (aunque actualicemos 'updated_at' si vuelve a entrar)
            $table->unique(['catalog_product_id', 'visitor_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('catalog_product_views');
        
        Schema::table('catalog_products', function (Blueprint $table) {
            $table->dropColumn('unique_views_count');
        });
    }
};
