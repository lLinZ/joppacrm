<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection(config('webpush.database_connection'))
            ->table(config('webpush.table_name'), function (Blueprint $table) {
                // Nombre legible del dispositivo (ej: "Chrome en Android") para poder
                // identificar cada suscripción desde el CRM.
                $table->string('device_name')->nullable()->after('endpoint');
            });
    }

    public function down(): void
    {
        Schema::connection(config('webpush.database_connection'))
            ->table(config('webpush.table_name'), function (Blueprint $table) {
                $table->dropColumn('device_name');
            });
    }
};
