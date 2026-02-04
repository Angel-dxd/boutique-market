/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                boutique: 'var(--color-boutique)',
                market: 'var(--color-market)',
            }
        },
    },
    plugins: [],
}