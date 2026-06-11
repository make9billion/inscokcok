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
            $table->string('banner_image_path')->nullable()->after('point_amount');
            $table->longText('detail_content')->nullable()->after('banner_image_path');
        });

        DB::table('events')
            ->where('slug', 'signup_bonus')
            ->whereNull('banner_image_path')
            ->update([
                'banner_image_path' => 'event-banners/event-banner-1.jpg',
                'detail_content' => '<h2>회원가입 포인트 적립 안내</h2><p>보험콕콕 회원가입을 완료하면 이벤트 설정에 따라 포인트가 자동 적립됩니다.</p>',
            ]);

        DB::table('events')
            ->where('slug', 'consultation_completed_bonus')
            ->whereNull('banner_image_path')
            ->update([
                'banner_image_path' => 'event-banners/event-banner-2.jpg',
                'detail_content' => '<h2>보험점검 완료 포인트 적립 안내</h2><p>보험점검으로 신청한 상담이 상담완료 상태가 되면 이벤트 설정에 따라 포인트가 자동 적립됩니다.</p>',
            ]);
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn(['banner_image_path', 'detail_content']);
        });
    }
};
