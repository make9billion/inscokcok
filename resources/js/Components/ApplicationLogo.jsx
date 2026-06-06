import logoUrl from '../../images/logo/logo.png';

export default function ApplicationLogo({ className = '', alt = '보험콕콕', ...props }) {
    return (
        <img
            {...props}
            src={logoUrl}
            alt={alt}
            className={`h-auto w-auto ${className}`}
        />
    );
}
