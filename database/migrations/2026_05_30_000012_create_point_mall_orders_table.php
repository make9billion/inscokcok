<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('point_mall_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('status', 40)->default('pending')->index();
            $table->string('order_number', 40)->unique();
            $table->unsignedInteger('total_points');
            $table->string('recipient_name', 80);
            $table->string('recipient_phone', 30);
            $table->string('postal_code', 20);
            $table->string('address_line1');
            $table->string('address_line2')->nullable();
            $table->string('delivery_memo')->nullable();
            $table->timestamp('ordered_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('point_mall_orders');
    }
};
