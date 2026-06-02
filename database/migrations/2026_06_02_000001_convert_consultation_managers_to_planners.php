<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')
            ->where('role', 'consultation_manager')
            ->update(['role' => 'planner']);
    }

    public function down(): void
    {
        // The old consultation-manager role has been intentionally retired.
    }
};
