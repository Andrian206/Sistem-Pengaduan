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
        // --- GOOGLE STITCH PALETTE ---
  			primary: "#324AA1", // Biru Google
  			secondary: "#C2E7FF", // Biru Muda Awan
        accent: "#47D06B", // Hijau Sukses
  			background: "#F0F4F9", // Abu sangat muda
        surface: "#FFFFFF", // Putih bersih
        text: "#1F1F1F", // Hampir hitam
  			border: "#E0E3E7",
  		},
  		borderRadius: {
  			lg: "1.5rem", // 24px
  			md: "1rem",   // 16px
  			sm: "0.5rem",
        full: "9999px" // Pill shape
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;