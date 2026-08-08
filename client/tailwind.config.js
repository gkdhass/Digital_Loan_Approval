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
        primary: "#E53935",
        primaryDark: "#C62828",
        primaryDarkMode: "#FF4D4F",
        primaryDarkModeHover: "#E53935",
        secondary: "#FFC107",
        secondaryDarkMode: "#FFD54F",
        background: "#FFFFFF",
        backgroundDark: "#111111",
        card: "#F8F9FA",
        cardDark: "#1A1A1A",
        cardSecondary: "#FFFFFF",
        cardSecondaryDark: "#222222",
        foreground: "#111111",
        foregroundDark: "#FFFFFF",
        foregroundSecondary: "#555555",
        foregroundSecondaryDark: "#CCCCCC",
        border: "#E53935",
        borderDark: "#FF4D4F",
        success: "#16A34A",
        successDark: "#22C55E",
        warning: "#FFC107",
        warningDark: "#FFD54F",
        error: "#E53935",
        errorDark: "#FF4D4F",
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
        'glow-red': '0 0 20px rgba(229, 57, 53, 0.25)',
        'glow-yellow': '0 0 30px rgba(255, 193, 7, 0.3)',
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
