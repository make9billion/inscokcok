<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('point_mall_orders', function (Blueprint $table) {
            $table->string('payment_provider', 40)->nullable()->after('cash_payment_amount');
            $table->string('payment_status', 40)->default('not_required')->after('payment_provider');
            $table->string('payment_order_id', 80)->nullable()->unique()->after('payment_status');
            $table->string('payment_key')->nullable()->after('payment_order_id');
            $table->string('payment_method', 80)->nullable()->after('payment_key');
            $table->timestamp('payment_requested_at')->nullable()->after('payment_method');
            $table->timestamp('payment_approved_at')->nullable()->after('payment_requested_at');
        });
    }

    public function down(): void
    {
        Schema::table('point_mall_orders', function (Blueprint $table) {
            $table->dropUnique(['payment_order_id']);
            $table->dropColumn([
                'payment_provider',
                'payment_status',
                'payment_order_id',
                'payment_key',
                'payment_method',
                'payment_requested_at',
                'payment_approved_at',
            ]);
        });
    }
};
