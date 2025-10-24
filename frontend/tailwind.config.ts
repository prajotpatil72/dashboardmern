/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  
  // Task 92: Dark mode with class strategy
  darkMode: 'class',
  
  theme: {
    // Task 97: DESKTOP-ONLY - Remove all mobile breakpoints
    screens: {
      'desktop': '1024px',
      'wide': '1440px',
      'ultrawide': '1920px',
    },
    
    extend: {
      // Task 91: Custom color palette for YouTube analytics theme
      colors: {
        // Primary brand colors
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        
        // YouTube red accent
        youtube: {
          light: '#ff6b6b',
          DEFAULT: '#ff0000',
          dark: '#cc0000',
        },
        
        // Task 93: Engagement rate colors
        engagement: {
          high: '#10b981',    // green - >5%
          medium: '#f59e0b',  // yellow - 2-5%
          low: '#ef4444',     // red - <2%
        },
        
        // Task 93: Chart colors (10 distinct colors)
        chart: {
          1: '#3b82f6',  // blue
          2: '#8b5cf6',  // purple
          3: '#ec4899',  // pink
          4: '#f59e0b',  // amber
          5: '#10b981',  // emerald
          6: '#06b6d4',  // cyan
          7: '#6366f1',  // indigo
          8: '#f97316',  // orange
          9: '#14b8a6',  // teal
          10: '#a855f7', // violet
        },
        
        // Dark mode optimized colors
        dark: {
          bg: '#0f172a',
          surface: '#1e293b',
          border: '#334155',
        }
      },
      
      // Task 94: Custom spacing for desktop layouts
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
        '144': '36rem',
      },
      
      // Task 95: Modern border radius
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      
      // Task 98: Custom animations
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      
      // Task 99: Gradient utilities
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-dark': 'linear-gradient(to bottom right, #0f172a, #1e293b)',
      },
      
      // Task 94: Custom shadows for depth
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'inner-lg': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      
      // Desktop-optimized font sizes
      fontSize: {
        'display': ['4rem', { lineHeight: '1.1', fontWeight: '700' }],
        'hero': ['3rem', { lineHeight: '1.2', fontWeight: '600' }],
      },
      
      // Task 97: Minimum widths for desktop
      minWidth: {
        'desktop': '1024px',
      },
    },
  },
  
  plugins: [
    // Task 96: Typography plugin for rich text content
    require('@tailwindcss/typography'),
  ],
}