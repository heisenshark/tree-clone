const { fontFamily } = require("tailwindcss/defaultTheme")
const { violet, blackA, mauve, green } = require('@radix-ui/colors')

/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./src/**/*.{js,ts,jsx,tsx}", "components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      }, colors: {
        ...mauve,
        ...violet,
        ...green,
        ...blackA,
      },


      keyframes: {
        "accordion-down": {
          from: { height: '0' },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: '0' },
        },
        overlayShow: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        contentShow: {
          from: { opacity: 0, transform: 'translate(-50%, -48%) scale(0.96)' },
          to: { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
        },

      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },

  },
  plugins: [require("tailwindcss-animate")],
}

module.exports = config
