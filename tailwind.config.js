/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Primary Colors (Teal)
        teal: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
        },
        // Accent Colors
        coral: {
          DEFAULT: '#FB7185',
          light: '#FECDD3',
        },
        yellow: {
          DEFAULT: '#FBBF24',
          light: '#FEF3C7',
        },
        // Status Colors
        success: {
          DEFAULT: '#22C55E',
          light: '#DCFCE7',
        },
        warning: '#F59E0B',
        error: '#EF4444',
        // Dark Mode
        dark: {
          bg: '#0F0F1A',
          card: '#1E1E2E',
          text: '#F8FAFC',
          muted: '#94A3B8',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
      borderRadius: {
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
      },
    },
  },
  plugins: [],
};
