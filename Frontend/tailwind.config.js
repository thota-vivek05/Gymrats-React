/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'gym-accent': '#8A2BE2',
        'gym-dark': '#000000',
        'gym-light': '#f1f1f1',
        'gym-glow': 'rgba(138, 43, 226, 0.4)',
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

