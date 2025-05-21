/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        appBgWhite: "#FEFBF4",
        appBgBeige: "#FFFAED",
        appLightGrey: "#F1EFE9",
        appMediumGrey: "#7C7C7F",
        appDarkGrey: "#262B2A",
        appMediumRed: "#EE664D",
        appBlack: "#191919"
      },
    },
  },
  plugins: [],
}