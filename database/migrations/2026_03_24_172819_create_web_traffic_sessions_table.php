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
        Schema::create('web_traffic_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('visitor_id')->index();
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->string('entry_url', 500)->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('last_active_at')->nullable();
            $table->integer('duration_seconds')->default(0);
            $table->timestamps();
            
            // Un visitante típico debería tener solo una sesión "activa" al mismo tiempo
            // Pero como creamos nuevas si pasan 30 minutos sin ping, visitor_id no es unique().
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('web_traffic_sessions');
    }
};
