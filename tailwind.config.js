/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'adopteez': {
          'primary': '#1A237E',
          'blue': '#1A237E',
          'dark': '#0D1342',
          'secondary': '#1A237E',
          'light': '#E8EAF6',
          'accent': '#FF6F00',
          'orange': '#FF6F00',
          'orange-light': '#FFA040',
          'white': '#FFFFFF',
          'gray-bg': '#F5F5F5',
          'text-dark': '#222222',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'lg': '1rem',
        'xl': '1.5rem',
        '2xl': '2rem',
        '3xl': '2.5rem',
      },
      boxShadow: {
        'xl': '0 8px 32px 0 rgba(60,60,60,0.10)',
        '2xl': '0 12px 48px 0 rgba(60,60,60,0.16)',
      },
      spacing: {
        'section': '6rem',
        'card': '2.5rem',
      },
    },
  },
  plugins: [],
}
