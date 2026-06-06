<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('point_mall_products', function (Blueprint $table) {
            $table->unsignedInteger('low_stock_threshold')->default(0)->after('stock_quantity');
            $table->unsignedInteger('sort_order')->default(0)->after('delivery_fee');
            $table->boolean('is_main_visible')->default(false)->after('is_featured');
        });

        Schema::create('point_mall_product_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('point_mall_product_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 40);
            $table->json('before')->nullable();
            $table->json('after')->nullable();
            $table->string('memo')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('point_mall_product_logs');

        Schema::table('point_mall_products', function (Blueprint $table) {
            $table->dropColumn([
                'low_stock_threshold',
                'sort_order',
                'is_main_visible',
            ]);
        });
    }
};
