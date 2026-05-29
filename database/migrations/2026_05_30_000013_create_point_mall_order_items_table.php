<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('point_mall_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('point_mall_order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('point_mall_product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('product_name', 160);
            $table->unsignedInteger('point_price');
            $table->unsignedInteger('quantity');
            $table->unsignedInteger('line_total_points');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('point_mall_order_items');
    }
};
