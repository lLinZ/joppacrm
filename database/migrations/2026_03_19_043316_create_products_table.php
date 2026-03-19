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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('sku')->nullable();
            $table->string('style')->nullable(); // Oversize, Normal
            $table->string('fabric_type')->nullable(); // Terry Spun, 100% Algodon
            $table->integer('size_s')->default(0);
            $table->integer('size_m')->default(0);
            $table->integer('size_l')->default(0);
            $table->integer('quantity')->default(0); // Sum of sizes, or for non-clothing items
            $table->integer('min_stock')->default(0);
            $table->decimal('price', 10, 2)->default(0);
            $table->decimal('cost', 10, 2)->default(0);
            $table->foreignId('supplier_id')->nullable()->constrained('suppliers')->nullOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
