/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary:  "#3A2E2A",
          soft:     "#5A463F",
          accent:   "#A68A64",
          bg:       "#F5F3F0",
          border:   "#E5E1DC",
          hover:    "#F3F2EF",
        },
      },
    },
  },
  plugins: [],
};
