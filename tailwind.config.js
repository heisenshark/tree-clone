const { fontFamily } = require("tailwindcss/defaultTheme")
const { violet, blackA, mauve, green } = require('@radix-ui/colors')

/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./src/**/*.{js,ts,jsx,tsx}", "components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // sans: ["var(--font-sans)", ...fontFamily.sans],
      }, colors: {
        ...mauve,
        ...violet,
        ...green,
        ...blackA,
      },
      screens: {
        // => @media (max-width: 1535px) { ... }
        'm2xl': { 'max': '1535px' },
        'mxl': { 'max': '1279px' },
        'mlg': { 'max': '1023px' },
        'mmd': { 'max': '767px' },
        'msm': { 'max': '639px' },
      },


      keyframes: {
        wave: {
          '0%': { transform: 'rotate(0.0deg)' },
          '10%': { transform: 'rotate(14deg)' },
          '20%': { transform: 'rotate(-8deg)' },
          '30%': { transform: 'rotate(14deg)' },
          '40%': { transform: 'rotate(-4deg)' },
          '50%': { transform: 'rotate(10.0deg)' },
          '60%': { transform: 'rotate(0.0deg)' },
          '100%': { transform: 'rotate(0.0deg)' },
        },

        accordion: {
          from: { height: '0' },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        accordionUp: {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: '0' },
        },
        translateRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        overlayShow: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        contentShow: {
          from: { opacity: '0', transform: 'translate(-50%, -48%) scale(0.96)' },
          to: { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' },
        },

      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "translate-right": "translateRight ease-out",
      },
    },

  },
  plugins: [],
}

module.exports = config
