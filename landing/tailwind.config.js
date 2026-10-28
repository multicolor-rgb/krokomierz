/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#08090B',
        surface: '#111318',
        surface2: '#191C22',
        line: '#272C35',
        lime: '#C6FF3D',
        cyan: '#4DE1FF',
        muted: '#9AA1AE',
      },
      fontFamily: {
        sans: ['Manrope Variable', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 80px rgba(198,255,61,0.18)',
        phone: '0 40px 120px rgba(0,0,0,0.65)',
      },
      backgroundImage: {
        'lime-gradient': 'linear-gradient(135deg,#C6FF3D 0%,#7DF7A0 45%,#4DE1FF 100%)',
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        marquee: 'marquee 32s linear infinite',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
      },
    },
  },
  plugins: [],
};
