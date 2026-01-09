/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        light: {
          bg: {
            primary: '#FCFCF9',
            secondary: '#FCFCF9',
            tertiary: '#f3f4f6',
          },
          text: {
            primary: '#111827',
            secondary: '#6b7280',
            muted: '#9ca3af',
            inverse: '#ffffff',
          },
          border: '#e5e7eb',
        },
        dark: {
          bg: {
            primary: '#0f172a',
            secondary: '#0f172a',
            tertiary: '#1e293b',
          },
          text: {
            primary: '#f8fafc',
            secondary: '#94a3b8',
            muted: '#64748b',
            inverse: '#0f172a',
          },
          border: '#334155',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
