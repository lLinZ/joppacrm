<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('show_in_catalog')->default(false)->after('category_id');
            $table->json('images')->nullable()->after('show_in_catalog');
            $table->text('description')->nullable()->after('images');
            $table->integer('catalog_order')->default(0)->after('description');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['show_in_catalog', 'images', 'description', 'catalog_order']);
        });
    }
};
