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
        Schema::create('order_costs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->decimal('revenue', 10, 2)->default(0);
            $table->decimal('base_cost', 10, 2)->default(0);
            $table->decimal('print_cost', 10, 2)->default(0);
            $table->decimal('logistics_cost', 10, 2)->default(0);
            $table->decimal('delivery_cost', 10, 2)->default(0);
            $table->decimal('other_costs', 10, 2)->default(0);
            $table->decimal('total_cost', 10, 2)->default(0);
            $table->decimal('net_profit', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_costs');
    }
};
