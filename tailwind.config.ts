import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#e8f0fb',
          100: '#c5d8f5',
          200: '#9dbfee',
          300: '#74a5e7',
          400: '#4d8ee1',
          500: '#1a7fe8',
          600: '#1056B0',
          700: '#0d4494',
          800: '#0a3478',
          900: '#07245c',
        },
        surface: {
          DEFAULT: '#0d1526',
          50:  '#1a2640',
          100: '#151f36',
          200: '#111829',
          300: '#0d1526',
          400: '#090f1c',
          500: '#060a13',
        },
        gold: {
          DEFAULT: '#d4a017',
          light: '#f59e0b',
          dark: '#b8860b',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #1056B0, #1a7fe8)',
        'brand-gradient-dark': 'linear-gradient(135deg, #0d1526, #1a2640)',
        'gold-gradient': 'linear-gradient(135deg, #b8860b, #d4a017, #f59e0b)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease forwards',
        'fade-in-up': 'fadeInUp 0.4s ease forwards',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.32, 0.72, 0, 1) forwards',
        'slide-down': 'slideDown 0.25s ease forwards',
        'scale-in': 'scaleIn 0.2s ease forwards',
        'shimmer': 'shimmer 1.5s infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        slideDown: {
          from: { transform: 'translateY(-10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          from: { transform: 'scale(0.95)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      boxShadow: {
        'brand': '0 8px 32px rgba(16, 86, 176, 0.35)',
        'brand-lg': '0 16px 48px rgba(16, 86, 176, 0.45)',
        'glass': '0 4px 24px rgba(0, 0, 0, 0.3)',
        'card': '0 2px 16px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
}

export default config
