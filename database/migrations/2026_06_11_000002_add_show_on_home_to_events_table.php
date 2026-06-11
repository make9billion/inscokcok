<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->boolean('show_on_home')->default(false)->after('is_active');
        });

        DB::table('events')
            ->whereIn('slug', ['signup_bonus', 'consultation_completed_bonus'])
            ->update(['show_on_home' => true]);
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn('show_on_home');
        });
    }
};
