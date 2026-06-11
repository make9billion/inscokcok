import SiteFooter from '@/Components/SiteFooter';
import SiteHeader from '@/Components/SiteHeader';

export default function PublicLayout({ children, auth, dark = false, insuranceHeader = false, pointMallHeader = false }) {
    return (
        <div className={dark ? 'flex min-h-screen flex-col bg-[#070b14] text-white' : 'flex min-h-screen flex-col bg-white text-toss-grey900'}>
            <SiteHeader auth={auth} dark={dark} insuranceHeader={insuranceHeader} pointMallHeader={pointMallHeader} />
            <main className={dark ? 'flex-1 bg-[#070b14]' : 'flex-1 bg-white'}>{children}</main>
            <SiteFooter dark={dark} />
        </div>
    );
}
