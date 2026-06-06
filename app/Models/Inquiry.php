<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inquiry extends Model
{
    public const CATEGORIES = [
        'site' => '사이트 이용문의',
        'event' => '이벤트 문의',
        'gift' => '사은품 문의',
        'delivery' => '배송 문의',
        'partnership' => '제휴 문의',
        'etc' => '기타 문의',
    ];

    public const STATUSES = [
        'received' => '접수',
        'reviewing' => '검토중',
        'answered' => '답변완료',
        'closed' => '종료',
    ];

    protected $fillable = [
        'category',
        'applicant_name',
        'phone',
        'email',
        'title',
        'body',
        'status',
        'admin_reply',
        'replied_at',
    ];

    protected function casts(): array
    {
        return [
            'replied_at' => 'datetime',
        ];
    }
}
