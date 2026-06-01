<?php

namespace App\Http\Requests;

use App\Enums\ConsultationType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreConsultationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', new Enum(ConsultationType::class)],
            'applicant_name' => ['required', 'string', 'max:80'],
            'phone' => ['required', 'string', 'max:30'],
            'birth_date' => ['nullable', 'date'],
            'current_monthly_premium' => ['nullable', 'integer', 'min:0', 'max:10000000'],
            'interested_product' => ['nullable', 'string', 'max:120'],
            'preferred_contact_time' => ['nullable', 'string', 'max:80'],
            'memo' => ['nullable', 'string', 'max:2000'],
            'privacy_agreement' => ['accepted'],
            'third_party_agreement' => ['nullable', 'boolean'],
        ];
    }

    public function attributes(): array
    {
        return [
            'type' => '상담 유형',
            'applicant_name' => '이름',
            'phone' => '연락처',
            'birth_date' => '생년월일',
            'current_monthly_premium' => '현재 월 보험료',
            'interested_product' => '관심 상품',
            'preferred_contact_time' => '희망 연락 시간',
            'memo' => '상담 메모',
            'privacy_agreement' => '개인정보 수집 및 이용 동의',
            'third_party_agreement' => '제3자 정보제공 동의',
        ];
    }
}
