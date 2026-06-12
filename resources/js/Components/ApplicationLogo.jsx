import logoUrl from '../../images/logo/logo.png';
import adminLogoUrl from '../../images/logo/logo_admin.png';

export default function ApplicationLogo({ className = '', alt = '보험콕콕', variant = 'default', ...props }) {
    return (
        <img
            {...props}
            src={variant === 'admin' ? adminLogoUrl : logoUrl}
            alt={alt}
            className={`h-auto w-auto ${className}`}
        />
    );
}
