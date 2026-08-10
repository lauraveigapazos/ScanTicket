/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'slate-gray': '#32433D',    //dark text
                'viridian': '#5E8F84',      //primary background
                'cambridge': '#7AA89D',     //primary light
                'myrtle': '#3D6F68',        //primary dark/buttons
                'white': '#FFFFFF',         //surface
                'smoke': '#F2F4F3',         //light surface
                'timberwolf': '#CFD5D1',    //borders
                'sunset': '#E8C48D',        //warn
                'melon': '#EBAA9A',         //error
                'coral': '#D47F72',         //strong error/error hover
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                heading: ['Sora', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}