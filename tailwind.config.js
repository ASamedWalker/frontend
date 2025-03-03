/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#FF6B00",
        secondary: "#2A2550",
        accent: "#FFD700",
        background: "#F8F9FA",
        success: "#28A745",
        danger: "#DC3545",
        warning: "#FFC107",
        info: "#17A2B8",
        dark: "#343A40",
        light: "#F8F9FA",
      },
    },
  },
  plugins: [],
};