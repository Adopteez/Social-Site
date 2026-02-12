/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        adopteez: {
          primary: "#2563eb",
          orange: "#f97316",
          orangeDark: "#ea580c",
          dark: "#1e3a5f",
          light: "#f3f6fa",
          gray: "#6b7280",
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1.5rem',
        '2xl': '2rem',
        '3xl': '2.5rem',
      },
      boxShadow: {
        'xl': '0 8px 32px 0 rgba(60,60,60,0.10)',
        '2xl': '0 12px 48px 0 rgba(60,60,60,0.16)',
      },
    },
  },
  plugins: [],
}
