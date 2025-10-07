/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
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
        appBlack: "#191919",
        appBlue: "#1565C0",
        appBlueDark: "#0D47A1",
        appBlueLight: "#2196F3",
        appBluePale: "#E3F2FD",
        appGreen: "#4CAF50",
        appGreenDark: "#2E7D32",
        appGreenLight: "#81C784",
      },
    },
    fontFamily: {
      "nunito-extralight": ["nunito-extralight"],
      "nunito-light": ["nunito-light"],
      nunito: ["nunito-regular"],
      "nunito-medium": ["nunito-medium"],
      "nunito-semibold": ["nunito-semibold"],
      "nunito-bold": ["nunito-bold"],
      "nunito-extrabold": ["nunito-extrabold"],
    },
  },
  plugins: [],
};
