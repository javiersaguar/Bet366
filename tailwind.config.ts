import type { Config } from 'tailwindcss';

/**
 * Sistema de diseño de Bet366.
 *
 * Base casi negra y muy contrastada para que lo único que brille sea el verde
 * de marca y los números de las cuotas. El resto del color es semántico: cada
 * tono significa algo (ganada, perdida, en votación, primero del ranking) y no
 * se usa por decorar.
 */
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Un `border` suelto no debe caer nunca en el gris por defecto de Tailwind.
      borderColor: ({ theme }) => ({ ...theme('colors'), DEFAULT: 'rgba(255,255,255,0.07)' }),
      divideColor: ({ theme }) => ({ ...theme('colors'), DEFAULT: 'rgba(255,255,255,0.07)' }),

      colors: {
        canvas: '#07080B',
        surface: {
          DEFAULT: '#0F1116',
          raised: '#161921',
          high: '#1D212B',
          sunken: '#0A0C10',
        },
        line: {
          DEFAULT: 'rgba(255,255,255,0.07)',
          strong: 'rgba(255,255,255,0.13)',
          glow: 'rgba(43,224,140,0.30)',
        },
        content: {
          DEFAULT: '#E9ECF2',
          muted: '#8D95A7',
          faint: '#5A6170',
        },
        brand: {
          DEFAULT: '#2BE08C',
          bright: '#63F2B4',
          deep: '#149E60',
          ink: '#052E1D',
        },
        win: '#2BE08C',
        lose: '#FF6B6B',
        info: '#5AA9FF',
        vote: '#A78BFA',
        gold: '#F5C24B',
      },

      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.04em' }],
      },
      letterSpacing: { tightest: '-0.035em' },
      borderRadius: { lg: '10px', xl: '13px', '2xl': '18px', '3xl': '26px' },

      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,.5), 0 12px 32px -18px rgba(0,0,0,.9)',
        lift: '0 2px 6px rgba(0,0,0,.5), 0 24px 56px -24px rgba(0,0,0,1)',
        'glow-brand': '0 0 0 1px rgba(43,224,140,.35), 0 10px 34px -12px rgba(43,224,140,.45)',
        'glow-vote': '0 0 0 1px rgba(167,139,250,.32), 0 10px 34px -12px rgba(167,139,250,.4)',
        inset: 'inset 0 1px 0 rgba(255,255,255,.05)',
      },

      transitionTimingFunction: {
        smooth: 'cubic-bezier(.22,.68,.28,1)',
        snap: 'cubic-bezier(.2,.9,.3,1.08)',
      },

      keyframes: {
        rise: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'none' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(.94)' },
          '60%': { opacity: '1', transform: 'scale(1.015)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(18px)' },
          to: { opacity: '1', transform: 'none' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        /* Latido del punto "en vivo" del contador. */
        ping: {
          '75%,100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        /* Flash cuando una cuota sube o baja. */
        flashUp: {
          '0%': { backgroundColor: 'rgba(43,224,140,0)' },
          '25%': { backgroundColor: 'rgba(43,224,140,.22)' },
          '100%': { backgroundColor: 'rgba(43,224,140,0)' },
        },
        flashDown: {
          '0%': { backgroundColor: 'rgba(255,107,107,0)' },
          '25%': { backgroundColor: 'rgba(255,107,107,.22)' },
          '100%': { backgroundColor: 'rgba(255,107,107,0)' },
        },
        /* Trazo del logotipo al entrar. */
        draw: {
          from: { strokeDashoffset: '340' },
          to: { strokeDashoffset: '0' },
        },
        confetti: {
          '0%': { opacity: '1', transform: 'translate3d(0,0,0) rotate(0deg)' },
          '100%': { opacity: '0', transform: 'translate3d(var(--dx), var(--dy), 0) rotate(var(--dr))' },
        },
        sheen: {
          '0%': { transform: 'translateX(-120%) skewX(-18deg)' },
          '60%,100%': { transform: 'translateX(220%) skewX(-18deg)' },
        },
      },

      animation: {
        rise: 'rise .34s cubic-bezier(.22,.68,.28,1) both',
        'pop-in': 'popIn .28s cubic-bezier(.2,.9,.3,1.08) both',
        'slide-up': 'slideUp .32s cubic-bezier(.22,.68,.28,1) both',
        shimmer: 'shimmer 1.6s infinite',
        ping: 'ping 1.6s cubic-bezier(0,0,.2,1) infinite',
        'flash-up': 'flashUp 1.1s ease-out',
        'flash-down': 'flashDown 1.1s ease-out',
        draw: 'draw 1s cubic-bezier(.22,.68,.28,1) both',
        confetti: 'confetti var(--dur,1.1s) cubic-bezier(.2,.6,.4,1) forwards',
        sheen: 'sheen 2.6s cubic-bezier(.4,0,.2,1) infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
