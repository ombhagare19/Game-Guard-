/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#0B1420',
        surface: '#132334',
        'surface-elevated': '#182C42',
        'surface-border': '#223954',
        'primary-text': '#F4F8FB',
        'secondary-text': '#A7BBC8',
        'status-safe': '#53E0B5',
        'status-info': '#55C9F5',
        'status-caution': '#F6BC59',
        'status-critical': '#FF6B75',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'monospace',
        ],
      },
      animation: {
        'sweep': 'sweep 2.5s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'typewriter': 'typewriter 1.5s steps(40, end)',
      },
      keyframes: {
        sweep: {
          '0%, 100%': { transform: 'translateY(-100%)', opacity: '0.2' },
          '50%': { transform: 'translateY(100%)', opacity: '0.8' },
        }
      }
    },
  },
  plugins: [],
}
