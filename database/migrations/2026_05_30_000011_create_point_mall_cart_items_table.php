<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('point_mall_cart_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('point_mall_cart_id')->constrained()->cascadeOnDelete();
            $table->foreignId('point_mall_product_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('quantity')->default(1);
            $table->timestamps();

            $table->unique(['point_mall_cart_id', 'point_mall_product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('point_mall_cart_items');
    }
};
