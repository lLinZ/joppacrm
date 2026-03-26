<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('design_request_items', function (Blueprint $table) {
            $table->string('placement')->nullable()->after('quantity'); // frontal, trasero, doble, pocket
            $table->string('image_back_path')->nullable()->after('image_path');
        });
    }

    public function down(): void
    {
        Schema::table('design_request_items', function (Blueprint $table) {
            $table->dropColumn(['placement', 'image_back_path']);
        });
    }
};
