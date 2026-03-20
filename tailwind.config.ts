import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        lemon: {
          50:  '#FFFEF5',
          100: '#FFFDE0',
          200: '#FFFBB0',
          300: '#FFF990',
          400: '#FFF87C', // 🍋 레몬 컬러
          500: '#FFE500',
          600: '#FFCC00',
          700: '#CC9900',
          800: '#996600',
          900: '#664400',
        },
        coral: {
          100: '#FFE8E8',
          200: '#FFD0D0',
          400: '#FF6B6B',
          500: '#FF5252',
        },
        mint: {
          50:  '#F0FFF8',
          100: '#DCFFF0',
          400: '#69F0AE',
          500: '#00E676',
          600: '#00C853',
        },
        sky: {
          50:  '#F0FAFF',
          100: '#E1F5FE',
          400: '#29B6F6',
          500: '#03A9F4',
          600: '#0288D1',
        },
        forest: {
          700: '#15803d', // 짙은 초록 — 레몬과 가장 잘 어울리는 보색
          800: '#166534',
          900: '#14532d',
        },
      },
      animation: {
        'bounce-in':  'bounceIn 0.35s cubic-bezier(0.36, 0.07, 0.19, 0.97) both',
        'float':      'float 3s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'slide-up':   'slideUp 0.25s ease-out both',
        'fade-in':    'fadeIn 0.2s ease-out both',
      },
      keyframes: {
        bounceIn: {
          '0%':   { transform: 'scale(0.75)', opacity: '0' },
          '60%':  { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.55' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        lemon:     '0 4px 20px rgba(255, 248, 124, 0.50)',
        coral:     '0 4px 20px rgba(255, 107, 107, 0.30)',
        mint:      '0 4px 20px rgba(0, 230, 118, 0.25)',
        sky:       '0 4px 20px rgba(3, 169, 244, 0.25)',
        card:      '0 2px 12px rgba(0,0,0,0.06)',
        'card-lg': '0 6px 24px rgba(0,0,0,0.09)',
        // 레거시 이름 유지
        cute:      '0 2px 12px rgba(0,0,0,0.06)',
        'cute-lg': '0 6px 24px rgba(0,0,0,0.09)',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Apple SD Gothic Neo',
          'Noto Sans KR',
          'Malgun Gothic',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}

export default config
