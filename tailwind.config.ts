import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			primary: "#2a76fd",
  			accent: "#7ee2f1",
  			warning: "#f16504",
  			success: "#4ade80",
  			"background-light": "#f8fafc",
  			"background-dark": "#0f0f23",
  			background: "#f8fafc",
  			foreground: "#0f0f23",
  		},
  		fontFamily: {
  			display: ["var(--font-public-sans)", "sans-serif"],
  		},
  		borderRadius: {
  			DEFAULT: "1rem",
  			lg: "2rem",
  			xl: "3rem",
  			full: "9999px",
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;