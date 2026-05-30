import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: [
                    'Toss Product Sans',
                    'Tossface',
                    'SF Pro KR',
                    'SF Pro Display',
                    'Apple SD Gothic Neo',
                    'Noto Sans KR',
                    ...defaultTheme.fontFamily.sans,
                ],
            },
            colors: {
                toss: {
                    blue: '#6366f1',
                    blueHover: '#2272eb',
                    blueLight: '#e8f3ff',
                    grey50: '#f9fafb',
                    grey100: '#f2f4f6',
                    grey200: '#e5e8eb',
                    grey500: '#8b95a1',
                    grey600: '#6b7684',
                    grey700: '#4e5968',
                    grey800: '#333d4b',
                    grey900: '#191f28',
                },
            },
        },
    },

    plugins: [forms],
};
