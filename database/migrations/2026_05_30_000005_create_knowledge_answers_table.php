<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('knowledge_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('knowledge_question_id')->constrained()->cascadeOnDelete();
            $table->foreignId('manager_id')->constrained('users')->restrictOnDelete();
            $table->text('body');
            $table->timestamps();

            $table->unique('knowledge_question_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('knowledge_answers');
    }
};
