<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('point_mall_orders', function (Blueprint $table) {
            $table->string('tracking_number', 80)->nullable()->after('delivery_memo');
        });
    }

    public function down(): void
    {
        Schema::table('point_mall_orders', function (Blueprint $table) {
            $table->dropColumn('tracking_number');
        });
    }
};
