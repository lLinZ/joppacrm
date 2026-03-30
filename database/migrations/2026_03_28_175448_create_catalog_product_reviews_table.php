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
        Schema::create('catalog_product_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('catalog_product_id')->constrained()->onDelete('cascade');
            $table->integer('rating');
            $table->text('comment');
            $table->string('user_name');
            $table->string('user_email')->nullable();
            $table->string('status')->default('pending'); // pending, approved, rejected
            $table->boolean('is_verified_purchase')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('catalog_product_reviews');
    }
};
