<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consultations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('assigned_planner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('type', 40);
            $table->string('status', 40)->default('received')->index();
            $table->string('applicant_name', 80);
            $table->string('phone', 30);
            $table->date('birth_date')->nullable();
            $table->unsignedInteger('current_monthly_premium')->nullable();
            $table->string('interested_product', 120)->nullable();
            $table->string('preferred_contact_time', 80)->nullable();
            $table->text('memo')->nullable();
            $table->timestamp('privacy_agreed_at');
            $table->timestamp('third_party_agreed_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('created_at');
            $table->index('assigned_planner_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consultations');
    }
};
