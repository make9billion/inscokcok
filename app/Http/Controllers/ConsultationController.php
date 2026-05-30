<?php

namespace App\Http\Controllers;

use App\Enums\ConsultationStatus;
use App\Http\Requests\StoreConsultationRequest;
use App\Models\Consultation;
use Illuminate\Http\RedirectResponse;

class ConsultationController extends Controller
{
    public function store(StoreConsultationRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        Consultation::create([
            'user_id' => $request->user()?->id,
            'type' => $validated['type'],
            'status' => ConsultationStatus::Received,
            'applicant_name' => $validated['applicant_name'],
            'phone' => $validated['phone'],
            'birth_date' => $validated['birth_date'] ?? null,
            'current_monthly_premium' => $validated['current_monthly_premium'] ?? null,
            'interested_product' => $validated['interested_product'] ?? null,
            'preferred_contact_time' => $validated['preferred_contact_time'] ?? null,
            'memo' => $validated['memo'] ?? null,
            'privacy_agreed_at' => now(),
            'third_party_agreed_at' => $request->boolean('third_party_agreement') ? now() : null,
        ]);

        return back()->with('success', '상담 신청이 접수되었습니다. 담당자가 확인 후 연락드릴게요.');
    }
}
