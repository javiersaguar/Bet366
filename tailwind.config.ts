import type { Config } from 'tailwindcss';

/**
 * Sistema de diseño de Bet366.
 *
 * La escala de grises es fria y muy contrastada (fondo casi negro) para que
 * el verde de marca y los numeros de las cuotas sean lo unico que brilla.
 */
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Un `border` suelto no debe caer nunca en el gris por defecto de Tailwind.
      borderColor: ({ theme }) => ({ ...theme('colors'), DEFAULT: 'rgba(255,255,255,0.07)' }),
      divideColor: ({ theme }) => ({ ...theme('colors'), DEFAULT: 'rgba(255,255,255,0.07)' }),
      colors: {
        canvas: '#08090C',
        surface: {
          DEFAULT: '#101218',
          raised: '#171A22',
          sunken: '#0B0D12',
        },
        line: {
          DEFAULT: 'rgba(255,255,255,0.07)',
          strong: 'rgba(255,255,255,0.13)',
        },
        content: {
          DEFAULT: '#E8EBF1',
          muted: '#8C94A6',
          faint: '#59606F',
        },
        brand: {
          DEFAULT: '#2BE08C',
          bright: '#5CF0AD',
          deep: 'rgba(43,224,140,0.10)',
        },
        win: '#2BE08C',
        lose: '#FF6B6B',
        info: '#5AA9FF',
        gold: '#F5C24B',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.04em' }],
      },
      letterSpacing: {
        tightest: '-0.035em',
      },
      borderRadius: {
        lg: '10px',
        xl: '13px',
        '2xl': '17px',
        '3xl': '24px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,.5), 0 12px 32px -16px rgba(0,0,0,.9)',
        lift: '0 2px 4px rgba(0,0,0,.5), 0 20px 48px -20px rgba(0,0,0,1)',
        glow: '0 0 0 1px rgba(43,224,140,.35), 0 8px 28px -10px rgba(43,224,140,.4)',
      },
      keyframes: {
        rise: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'none' },
        },
        sweep: {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(100%)' },
        },
      },
      animation: {
        rise: 'rise .3s cubic-bezier(.2,.7,.3,1) both',
        sweep: 'sweep 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
