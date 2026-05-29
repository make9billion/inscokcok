<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('point_ledger_entries', function (Blueprint $table) {
            $table->foreign('order_id')
                ->references('id')
                ->on('point_mall_orders')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('point_ledger_entries', function (Blueprint $table) {
            $table->dropForeign(['order_id']);
        });
    }
};
