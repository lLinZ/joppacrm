<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seamstress_applications', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('phone');
            $table->string('location');
            $table->decimal('price_per_piece', 10, 2)->nullable();
            $table->text('budget_notes')->nullable();
            $table->string('experience_years')->nullable(); // menos_1, 1_3, 3_5, mas_5
            $table->json('machines')->nullable();
            $table->unsignedInteger('weekly_capacity')->nullable();
            $table->text('message')->nullable();
            $table->json('photos')->nullable();
            $table->string('status')->default('pending'); // pending, reviewed, contacted, hired, rejected
            $table->text('admin_notes')->nullable();
            $table->string('source')->nullable(); // utm_source del link compartido
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seamstress_applications');
    }
};
