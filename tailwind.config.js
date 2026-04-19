/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0F1A",
        foreground: "#F3F4F6",
        primary: {
          DEFAULT: "#7C3AED", // Violet
          hover: "#6D28D9",
        },
        secondary: {
          DEFAULT: "#EC4899", // Pink Gradient Target
          hover: "#DB2777",
        },
        accent: {
          DEFAULT: "#22D3EE", // Cyan
          hover: "#06B6D4",
        },
        card: {
          DEFAULT: "rgba(255, 255, 255, 0.05)",
          border: "rgba(255, 255, 255, 0.1)",
        }
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(to right, #7C3AED, #EC4899)",
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
};
