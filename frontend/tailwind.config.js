/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: {
            DEFAULT: '#007AFF', // The main blue
            light: '#E6F2FF',   // A lighter shade for backgrounds, highlights
            dark: '#005ECC',    // A darker shade for hover states
          },
          secondary: {
            DEFAULT: '#4A4A4A', // Dark gray for primary text
            light: '#6B7280',   // Lighter gray for secondary text
          },
          background: '#F7F8FA', // Light gray page background
          surface: '#FFFFFF',     // White for cards
        },
        status: {
            success: {
                DEFAULT: '#28a745', // Green
                light: '#D4EDDA',
            },
            danger: {
                DEFAULT: '#dc3545', // Red
                light: '#F8D7DA',
            },
            warning: {
                DEFAULT: '#ffc107', // Yellow
                light: '#FFF3CD',
            },
            info: {
                DEFAULT: '#17a2b8', // Teal/Info
                light: '#D1ECF1',
            }
        }
      },
      fontFamily: {
        // Assuming Vazirmatn is a good choice for Persian font.
        // It needs to be imported in the layout file (e.g., from Google Fonts).
        sans: ['Vazirmatn', 'sans-serif'],
      },
      borderRadius: {
        'lg': '0.75rem', // Slightly larger rounded corners
        'xl': '1rem',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)',
        'card-hover': '0 10px 15px -3px rgb(0 0 0 / 0.07), 0 4px 6px -4px rgb(0 0 0 / 0.07)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
