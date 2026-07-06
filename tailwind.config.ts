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
        dashboard: {
          bg: "#0a0e1a",
          surface: "rgba(255, 255, 255, 0.06)",
          border: "rgba(255, 255, 255, 0.1)",
          accent: "#5b8def",
          warm: "#e8a87c",
          success: "#4ade80",
          warning: "#fbbf24",
          danger: "#f87171",
        },
      },
      fontFamily: {
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
        body: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["3.5rem", { lineHeight: "1.1", fontWeight: "600" }],
        "display-lg": ["2.25rem", { lineHeight: "1.2", fontWeight: "600" }],
        "display-md": ["1.5rem", { lineHeight: "1.3", fontWeight: "500" }],
        "display-sm": ["1.125rem", { lineHeight: "1.4", fontWeight: "500" }],
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
        "glass-lg": "0 16px 48px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
      },
      backdropBlur: {
        glass: "20px",
      },
    },
  },
  plugins: [],
};

export default config;
