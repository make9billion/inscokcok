import { ArrowLeft, CheckCircle2 } from 'lucide-react';

import { consultationConsentPolicies } from '@/Constants/consultationConsentPolicies';

export function ConsultationConsentPolicyView({
    policyKey,
    onBack,
    onAgree,
    accent = '#f47b20',
    bodyClassName = 'max-h-[360px]',
}) {
    const policy = consultationConsentPolicies[policyKey];

    if (!policy) {
        return null;
    }

    return (
        <div className="flex h-full min-h-0 flex-col">
            <button
                type="button"
                onClick={onBack}
                className="inline-flex w-fit items-center gap-2 text-sm font-bold text-gray-500 transition hover:text-gray-900"
            >
                <ArrowLeft className="size-4" />
                신청폼으로 돌아가기
            </button>

            <div className={`mt-5 min-h-0 flex-1 overflow-y-auto pr-2 ${bodyClassName}`}>
                <p className="text-xs font-black uppercase tracking-wide" style={{ color: accent }}>
                    Consent
                </p>
                <h3 className="mt-1 text-xl font-black text-gray-950">{policy.title}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-gray-500">{policy.description}</p>

                <div className="mt-5 space-y-5">
                    {policy.sections.map((section) => (
                        <section key={section.title}>
                            <h4 className="text-sm font-black text-gray-900">{section.title}</h4>
                            <div className="mt-2 space-y-2 text-sm font-medium leading-6 text-gray-600">
                                {section.body.map((paragraph) => (
                                    <p key={paragraph}>{paragraph}</p>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>

            <button
                type="button"
                onClick={onAgree}
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-black text-white transition hover:opacity-90"
                style={{ backgroundColor: accent }}
            >
                동의하기
                <CheckCircle2 className="size-4" />
            </button>
        </div>
    );
}

export default function ConsultationConsentPanel({ agreements, onViewPolicy, checkboxClassName = '' }) {
    return (
        <div className="grid gap-3">
            {agreements.map((agreement) => (
                <div key={agreement.field} className="grid gap-2">
                    <div className="flex items-center justify-between gap-3">
                        <label className="flex min-w-0 items-center gap-2 text-sm font-black text-gray-800">
                            <input
                                type="checkbox"
                                checked={agreement.checked}
                                onChange={(event) => agreement.onChange(event.target.checked)}
                                className={checkboxClassName}
                            />
                            <span>{agreement.label}</span>
                        </label>
                        <button
                            type="button"
                            onClick={() => onViewPolicy(agreement.policyKey)}
                            className="shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-black text-gray-600 transition hover:border-gray-400 hover:text-gray-950"
                        >
                            보기
                        </button>
                    </div>
                    {agreement.error && <p className="text-xs font-semibold text-red-600">{agreement.error}</p>}
                </div>
            ))}
        </div>
    );
}
