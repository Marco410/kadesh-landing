import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Canonical brand lives in src/app/globals.css (--color-kadesh).
        // These entries stay in sync so JS tooling does not resurrect the old orange.
        kadesh: {
          DEFAULT: '#216BFA',
          50: '#EEF4FF',
          100: '#D6E5FF',
          200: '#ADC9FF',
          300: '#7AA8FF',
          400: '#4788FF',
          500: '#216BFA',
          600: '#1A56D6',
          700: '#1441A8',
          800: '#0E2D7A',
          900: '#081A4C',
        },
        orange: {
          50: '#EEF4FF',
          100: '#D6E5FF',
          200: '#ADC9FF',
          300: '#7AA8FF',
          400: '#4788FF',
          500: '#216BFA',
          600: '#1A56D6',
          700: '#1441A8',
          800: '#0E2D7A',
          900: '#081A4C',
        },
        green: {
          50: '#E6F4EA',
          100: '#CDE9D5',
          200: '#A8D5BA',
          300: '#7FC39C',
          400: '#5BAA7B',
          500: '#3B8C5A',
          600: '#2C6B44',
          700: '#1D4A2E',
          800: '#11301B',
          900: '#06170A',
        },
        brown: {
          50: '#F5F3F1',
          100: '#E9E3DF',
          200: '#CFC0B7',
          300: '#B39C8C',
          400: '#8C6B4B',
          500: '#6B4B2C',
          600: '#4A2E1D',
          700: '#301B11',
          800: '#170A06',
          900: '#0A0603',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;

