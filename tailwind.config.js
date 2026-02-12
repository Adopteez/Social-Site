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
    },
  },
  plugins: [],
}
