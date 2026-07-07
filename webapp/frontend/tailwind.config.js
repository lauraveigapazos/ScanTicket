/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'slate-gray': '#32433D',
                'viridian': '#5E8F84',
                'cambridge': '#7AA89D',
                'myrtle': '#3D6F68',
                'smoke': '#F2F4F3',
                'timberwolf': '#CFD5D1',
                'sunset': '#E8C48D',
                'melon': '#EBAA9A',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                heading: ['Sora', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}