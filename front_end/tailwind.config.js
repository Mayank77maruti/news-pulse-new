/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        plus: ["Plus Jakarta Display", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
        open:["Open Sans", "sans-serif"],
      },
      colors: {
        silver: "#C0C0C0",
        greyish: "E2E8F0"
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
