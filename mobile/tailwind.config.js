/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#08090B',
        surface: '#121418',
        surface2: '#1A1D22',
        line: '#262B33',
        lime: '#C6FF3D',
        lime2: '#9BE800',
        cyan: '#4DE1FF',
        muted: '#8B93A1',
      },
      fontFamily: {
        sans: ['Manrope Variable', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: { '4xl': '2rem', '5xl': '2.5rem' },
      boxShadow: {
        glow: '0 0 60px rgba(198,255,61,0.22)',
        card: '0 18px 60px rgba(0,0,0,0.45)',
      },
      backgroundImage: {
        'lime-gradient': 'linear-gradient(135deg,#C6FF3D 0%,#7DF7A0 45%,#4DE1FF 100%)',
        'mesh': 'radial-gradient(60% 50% at 80% 0%, rgba(198,255,61,.14) 0%, transparent 70%), radial-gradient(50% 40% at 0% 30%, rgba(77,225,255,.10) 0%, transparent 70%)',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      animation: { float: 'float 6s ease-in-out infinite' },
    },
  },
  plugins: [],
};
