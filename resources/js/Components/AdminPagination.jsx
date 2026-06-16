import { Link } from '@inertiajs/react';

function labelText(label = '') {
    if (label.includes('Previous') || label.includes('pagination.previous')) {
        return '이전';
    }

    if (label.includes('Next') || label.includes('pagination.next')) {
        return '다음';
    }

    return label.replace('&laquo;', '').replace('&raquo;', '').trim();
}

export default function AdminPagination({ pagination }) {
    if (!pagination || !pagination.total || pagination.total <= 0) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-gray-500">
                총 <span className="font-bold text-gray-800">{pagination.total}</span>건 중{' '}
                <span className="font-bold text-gray-800">{pagination.from ?? 0}</span>
                {' - '}
                <span className="font-bold text-gray-800">{pagination.to ?? 0}</span>건 표시
            </p>

            <nav className="flex flex-wrap gap-1" aria-label="페이지 이동">
                {pagination.links?.map((link, index) => {
                    const label = labelText(link.label);
                    const disabled = !link.url;

                    if (disabled) {
                        return (
                            <span
                                key={`${label}-${index}`}
                                className="inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-gray-200 px-3 text-sm font-semibold text-gray-300"
                            >
                                {label}
                            </span>
                        );
                    }

                    return (
                        <Link
                            key={`${label}-${index}`}
                            href={link.url}
                            preserveScroll
                            preserveState
                            className={`inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm font-semibold transition ${
                                link.active
                                    ? 'border-gray-900 bg-gray-900 text-white'
                                    : 'border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
                            }`}
                        >
                            {label}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
