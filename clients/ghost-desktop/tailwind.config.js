/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        identra: {
          // Theme-aware via CSS variables (dark/light in App.css)
          bg: 'var(--identra-bg)',
          surface: 'var(--identra-surface)',
          'surface-elevated': 'var(--identra-surface-elevated)',
          'surface-hover': 'var(--identra-surface-hover)',
          border: 'var(--identra-border)',
          'border-subtle': 'var(--identra-border-subtle)',
          divider: 'var(--identra-divider)',
          primary: 'var(--identra-primary)',
          'primary-light': 'var(--identra-primary-light)',
          'primary-dark': 'var(--identra-primary-dark)',
          success: 'var(--identra-success)',
          warning: 'var(--identra-warning)',
          error: 'var(--identra-error)',
          active: 'var(--identra-active)',
          text: {
            primary: 'var(--identra-text-primary)',
            secondary: 'var(--identra-text-secondary)',
            tertiary: 'var(--identra-text-tertiary)',
            muted: 'var(--identra-text-muted)',
            disabled: 'var(--identra-text-disabled)',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.02em' }],
        'sm': ['0.8125rem', { lineHeight: '1.25rem', letterSpacing: '0.01em' }],
        'base': ['0.9375rem', { lineHeight: '1.5rem', letterSpacing: '0' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '500' }],
        'xl': ['1.375rem', { lineHeight: '1.875rem', fontWeight: '600' }],
        '2xl': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '600' }],
      },
      animation: {
        'fade': 'fade 120ms ease-out',
        'slide-in-left': 'slide-in-left 200ms ease-out',
        'slide-in-right': 'slideInRight 300ms ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'button-press': 'button-press 150ms ease-out',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        'fade': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slideInRight': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(82, 82, 91, 0.2)' },
          '50%': { boxShadow: '0 0 30px rgba(82, 82, 91, 0.4)' },
        },
        'button-press': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}

