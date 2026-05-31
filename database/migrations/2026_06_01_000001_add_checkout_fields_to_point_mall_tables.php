<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('point_mall_products', function (Blueprint $table) {
            $table->string('delivery_type', 20)->default('free')->after('stock_quantity');
            $table->unsignedInteger('delivery_fee')->default(0)->after('delivery_type');
        });

        Schema::table('point_mall_orders', function (Blueprint $table) {
            $table->unsignedInteger('used_points')->default(0)->after('total_points');
            $table->unsignedInteger('delivery_fee')->default(0)->after('used_points');
            $table->unsignedInteger('cash_payment_amount')->default(0)->after('delivery_fee');
        });
    }

    public function down(): void
    {
        Schema::table('point_mall_orders', function (Blueprint $table) {
            $table->dropColumn(['used_points', 'delivery_fee', 'cash_payment_amount']);
        });

        Schema::table('point_mall_products', function (Blueprint $table) {
            $table->dropColumn(['delivery_type', 'delivery_fee']);
        });
    }
};
