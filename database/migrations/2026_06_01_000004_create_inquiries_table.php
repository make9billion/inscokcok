<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inquiries', function (Blueprint $table) {
            $table->id();
            $table->string('category', 40);
            $table->string('applicant_name', 80);
            $table->string('phone', 30)->nullable();
            $table->string('email', 160)->nullable();
            $table->string('title', 160);
            $table->text('body');
            $table->string('status', 40)->default('received')->index();
            $table->text('admin_reply')->nullable();
            $table->timestamp('replied_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inquiries');
    }
};
