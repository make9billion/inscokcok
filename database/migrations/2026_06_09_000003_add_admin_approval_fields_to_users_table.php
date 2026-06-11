<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('admin_approval_status', 20)->nullable()->after('role')->index();
            $table->string('admin_requested_role', 20)->nullable()->after('admin_approval_status');
            $table->timestamp('admin_approved_at')->nullable()->after('admin_requested_role');
            $table->foreignId('admin_approved_by')->nullable()->after('admin_approved_at')->constrained('users')->nullOnDelete();
        });

        DB::table('users')
            ->whereIn('role', ['admin', 'planner'])
            ->update([
                'admin_approval_status' => 'approved',
                'admin_requested_role' => DB::raw('role'),
                'admin_approved_at' => now(),
            ]);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('admin_approved_by');
            $table->dropColumn(['admin_approval_status', 'admin_requested_role', 'admin_approved_at']);
        });
    }
};
