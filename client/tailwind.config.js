/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // New Design System Colors
        primary: {
          bg: {
            light: '#F3F4F6',
            dark: '#1A1A1A',
          },
        },
        surface: {
          light: '#FFFFFF',
          dark: '#0A0A0A',
        },
        golden: {
          50: '#FEFCE8',
          100: '#FEF9C3',
          200: '#FEF08A',
          300: '#FDE047',
          400: '#FACC15',
          500: '#E8C547', // Main golden yellow
          600: '#D4AF37', // Darker golden
          700: '#B8941F',
          800: '#8A6E17',
          900: '#5C4910',
        },
        success: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#86EFAC', // Button background light
          400: '#6EE7A0', // Button hover dark
          500: '#34D399',
          600: '#10B981',
          700: '#059669',
          800: '#047857',
          900: '#052E16', // Button text
        },
        // Legacy colors for backward compatibility
        navy: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        accent: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        }
      },
      backgroundColor: {
        'primary': 'var(--color-bg-primary)',
        'surface': 'var(--color-bg-surface)',
      },
      textColor: {
        'primary': 'var(--color-text-primary)',
        'secondary': 'var(--color-text-secondary)',
        'heading': 'var(--color-text-heading)',
      },
      borderColor: {
        'primary': 'var(--color-border-primary)',
        'border-primary': 'var(--color-border-primary)', // Add explicit border-primary
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
        'soft-lg': '0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.1)',
        'soft-xl': '0 10px 15px rgba(0, 0, 0, 0.05), 0 4px 6px rgba(0, 0, 0, 0.1)',
        'glow-green': '0 0 20px rgba(134, 239, 172, 0.4)',
        'glow-golden': '0 0 30px rgba(212, 175, 55, 0.3)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'count-up': 'countUp 1s ease-out',
        'rotate-y': 'rotateY 5s ease-in-out infinite',
        'shine': 'shine 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        rotateY: {
          '0%, 100%': { transform: 'perspective(1000px) rotateY(-15deg) rotateX(5deg)' },
          '50%': { transform: 'perspective(1000px) rotateY(15deg) rotateX(-5deg)' },
        },
        shine: {
          '0%, 100%': { backgroundPosition: '200% center' },
          '50%': { backgroundPosition: '-200% center' },
        },
      }
    },
  },
  plugins: [],
}
