<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role', 40)->default('member')->index()->after('password');
            $table->string('phone', 30)->nullable()->index()->after('email');
            $table->date('birth_date')->nullable()->after('phone');
            $table->string('gender', 20)->nullable()->after('birth_date');
            $table->string('postal_code', 20)->nullable()->after('gender');
            $table->string('address_line1')->nullable()->after('postal_code');
            $table->string('address_line2')->nullable()->after('address_line1');
            $table->timestamp('withdrawn_at')->nullable()->after('remember_token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role']);
            $table->dropIndex(['phone']);

            $table->dropColumn([
                'role',
                'phone',
                'birth_date',
                'gender',
                'postal_code',
                'address_line1',
                'address_line2',
                'withdrawn_at',
            ]);
        });
    }
};
