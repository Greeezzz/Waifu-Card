/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // Pastiin path ini sesuai struktur folder lu
  ],
  theme: {
    extend: {},
    screens: {
      xs: '400px',
      sm: '640px',
      // ...existing...
    },
  },
  plugins: [],
}