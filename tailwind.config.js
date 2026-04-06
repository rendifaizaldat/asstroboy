/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#FF8C94", // Pink pastel
        secondary: "#FFD1DC",
        accent: "#95E1D3",
        dark: "#4A4A4A",
      },
    },
  },
  plugins: [],
};
