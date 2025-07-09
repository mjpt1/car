/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      // Example primary color for the project based on 0.png (can be adjusted)
      colors: {
        'brand-primary': '#007AFF', // A blue often used, adjust if specific blue from 0.png
        'brand-secondary': '#4B5563', // A gray for text or secondary elements
        'brand-accent': '#FF9500', // An orange/yellow for accents, adjust from 0.png
        'brand-background': '#F9FAFB', // Light gray background
        'brand-surface': '#FFFFFF', // White for cards, surfaces
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // Common plugin for better default form styling
  ],
};
