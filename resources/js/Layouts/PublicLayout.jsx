import SiteFooter from '@/Components/SiteFooter';
import SiteHeader from '@/Components/SiteHeader';

export default function PublicLayout({ children, auth }) {
    return (
        <div className="min-h-screen bg-white text-toss-grey900">
            <SiteHeader auth={auth} />
            <main className="bg-white">{children}</main>
            <SiteFooter />
        </div>
    );
}
