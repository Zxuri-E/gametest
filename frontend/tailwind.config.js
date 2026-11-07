/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../shared/src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: {
          950: '#06080d',
          900: '#0a0d14',
          850: '#0e131d',
          800: '#141a26',
          700: '#1c2436',
          600: '#263147',
        },
        border: {
          subtle: '#1e2638',
          default: '#28344c',
          hover: '#3a4b6b',
        },
        accent: {
          cyan: '#06b6d4',
          'cyan-glow': '#22d3ee',
          blue: '#3b82f6',
          indigo: '#6366f1',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
          violet: '#8b5cf6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'subtle-glow': '0 0 20px -5px rgba(6, 182, 212, 0.15)',
        'panel': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        'neu-raised': '4px 4px 14px rgba(0, 0, 0, 0.55), -2px -2px 10px rgba(255, 255, 255, 0.02)',
        'neu-raised-hover': '6px 6px 18px rgba(0, 0, 0, 0.65), -3px -3px 12px rgba(255, 255, 255, 0.04)',
        'neu-inset': 'inset 2px 2px 6px rgba(0, 0, 0, 0.6), inset -1px -1px 4px rgba(255, 255, 255, 0.03)',
        'neu-inset-deep': 'inset 3px 3px 10px rgba(0, 0, 0, 0.8), inset -2px -2px 6px rgba(255, 255, 255, 0.02)',
        'cyan-glow': '0 0 16px rgba(6, 182, 212, 0.25)',
      },
    },
  },
  plugins: [],
}

