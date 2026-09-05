/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-fraunces)', 'Fraunces', 'Lora', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        canvas: {
          base: '#FFF7EE',
          'gradient-1': '#FFD9A0',
          'gradient-2': '#FFB4A2',
          'gradient-3': '#CFE8CB',
        },
        ink: {
          DEFAULT: '#22282B',
          muted: '#5C6660',
          light: '#8C9690',
        },
        accent: {
          primary: '#E8863A',
          'primary-hover': '#D97528',
          'primary-subtle': '#FFF3E8',
          trust: '#2F6E52',
          'trust-hover': '#255841',
          'trust-subtle': '#EEF7F2',
          alert: '#C4522E',
          'alert-hover': '#AF4523',
          'alert-subtle': '#FDF1ED',
        },
        glass: {
          surface: 'rgba(255, 255, 255, 0.55)',
          'surface-subtle': 'rgba(255, 255, 255, 0.40)',
          'surface-prominent': 'rgba(255, 255, 255, 0.80)',
          border: 'rgba(255, 255, 255, 0.65)',
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
      boxShadow: {
        'glass-sm': '0 4px 16px rgba(34, 40, 43, 0.06)',
        'glass': '0 8px 32px rgba(34, 40, 43, 0.10)',
        'glass-lg': '0 16px 48px rgba(34, 40, 43, 0.14)',
        'glass-hover': '0 12px 36px rgba(34, 40, 43, 0.14)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'floatSlow 24s ease-in-out infinite alternate',
        'float-reverse': 'floatReverse 28s ease-in-out infinite alternate',
        'float-third': 'floatThird 20s ease-in-out infinite alternate',
      },
      keyframes: {
        floatSlow: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(40px, -30px) scale(1.08)' },
          '100%': { transform: 'translate(-20px, 20px) scale(0.96)' },
        },
        floatReverse: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(-35px, 35px) scale(1.05)' },
          '100%': { transform: 'translate(25px, -20px) scale(0.95)' },
        },
        floatThird: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(30px, 20px) scale(1.06)' },
          '100%': { transform: 'translate(-15px, -25px) scale(0.97)' },
        },
      },
    },
  },
  plugins: [],
};
