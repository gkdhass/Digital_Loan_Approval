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
        // Light Mode - Trust & Clarity
        primary: "#123B5D",
        primaryHover: "#0E7490",
        secondary: "#0F766E",
        secondaryHover: "#0D6E66",
        accent: "#EAB308",
        accentHover: "#CA8A04",
        background: "#F4F7F9",
        card: "#FFFFFF",
        cardElevated: "#F8FAFC",
        foreground: "#0F172A",
        foregroundSecondary: "#64748B",
        foregroundMuted: "#94A3B8",
        border: "#D9E2E8",
        input: "#F8FAFC",
        success: "#16A34A",
        warning: "#F59E0B",
        error: "#DC2626",
        successBadge: "#DCFCE7",
        successText: "#166534",
        successBorder: "#BBF7D0",
        warningBadge: "#FEF3C7",
        warningText: "#92400E",
        warningBorder: "#FDE68A",
        errorBadge: "#FEE2E2",
        errorText: "#991B1B",
        errorBorder: "#FECACA",
        
        // Dark Mode - Secure Banking
        primaryDark: "#38BDF8",
        primaryHoverDark: "#0EA5E9",
        secondaryDark: "#2DD4BF",
        secondaryHoverDark: "#14B8A6",
        accentDark: "#FACC15",
        accentHoverDark: "#EAB308",
        backgroundDark: "#071521",
        cardDark: "#0D2233",
        cardSecondaryDark: "#0A1A28",
        cardElevatedDark: "#122C40",
        foregroundDark: "#F8FAFC",
        foregroundSecondaryDark: "#94A3B8",
        foregroundMutedDark: "#64748B",
        borderDark: "#1E3A4F",
        inputDark: "#0D2233",
        successDark: "#22C55E",
        warningDark: "#FBBF24",
        errorDark: "#F87171",
        successBadgeDark: "#166534",
        successTextDark: "#DCFCE7",
        successBorderDark: "#15803D",
        warningBadgeDark: "#92400E",
        warningTextDark: "#FEF3C7",
        warningBorderDark: "#B45309",
        errorBadgeDark: "#991B1B",
        errorTextDark: "#FEE2E2",
        errorBorderDark: "#B91C1C",
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
        'glow-primary': '0 0 20px rgba(56, 189, 248, 0.3)',
        'glow-secondary': '0 0 20px rgba(45, 212, 191, 0.3)',
        'glow-accent': '0 0 20px rgba(250, 204, 21, 0.3)',
        'glow-logo': '0 0 30px rgba(56, 189, 248, 0.4)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        logo: ['Poppins', 'Montserrat', 'Inter', 'sans-serif'],
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
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
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
        shimmer: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { filter: 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.4))' },
          '50%': { filter: 'drop-shadow(0 0 16px rgba(56, 189, 248, 0.6))' },
        },
      }
    },
  },
  plugins: [],
}
