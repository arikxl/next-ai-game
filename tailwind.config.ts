import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        'primary': '#ff77e9',
        'trans': 'rgba(20, 20, 20,0.8)',
        'trans1': 'rgba(20, 20, 20,0.6)',

      },
      fontFamily: {
        'chakra': 'var(--font-chakra)'
      }
    },
  },
  plugins: [],
}
export default config
