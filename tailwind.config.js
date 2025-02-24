/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',  
  theme: {
    extend: {},
    fontFamily: {
      roboto: ['Roboto', 'sans-serif'],  
    },
  },
  plugins: [],
};
