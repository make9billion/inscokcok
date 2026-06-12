import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children, wide = false, logoVariant = 'default' }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-100 pt-4 sm:justify-center sm:pt-0">
            <div>
                <Link href="/">
                    <ApplicationLogo variant={logoVariant} className={logoVariant === 'admin' ? 'h-16 max-w-56 object-contain' : 'h-14 max-w-48 object-contain'} />
                </Link>
            </div>

            <div className={`mt-4 w-full overflow-hidden bg-white px-4 py-4 shadow-md sm:rounded-lg ${wide ? 'sm:max-w-5xl' : 'sm:max-w-md sm:px-6'}`}>
                {children}
            </div>
        </div>
    );
}
