import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0a0a0a",
          card: "#141414",
          elevated: "#1f1f1f",
        },
        accent: {
          DEFAULT: "#e50914",
          hover: "#f40612",
        },
        gold: {
          DEFAULT: "#f5c518",
          hover: "#e6b800",
        },
        text: {
          DEFAULT: "#ffffff",
          muted: "#b3b3b3",
        },
        border: {
          DEFAULT: "#333333",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "Arial", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "8px",
      },
      boxShadow: {
        glow: "0 8px 32px rgba(0, 0, 0, 0.6)",
      }
    },
  },
  plugins: [],
};

export default config;
