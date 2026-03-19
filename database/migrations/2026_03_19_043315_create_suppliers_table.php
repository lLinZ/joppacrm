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
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('type')->nullable(); // Franelas, Papel seda, Maquinas
            $table->string('instagram')->nullable();
            $table->integer('reliability')->nullable()->comment('1 to 5 stars');
            $table->string('wholesale_price')->nullable();
            $table->string('platform')->nullable(); // Facebook, Whatsapp, etc
            $table->text('last_purchase_notes')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('suppliers');
    }
};
