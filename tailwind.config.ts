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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "#F8FAFC", // Putih keabu-abuan (Modern clean)
        foreground: "#1F2937", // Abu Gelap (Teks)

        // --- PALET RESMI SapaIKMP ---
        primary: {
          DEFAULT: "#2a76fd", // Biru Gelap (Brand Utama/Header)
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#7ee2f1", // Cyan (Aksen/Dekorasi)
          foreground: "#0f172a",
        },
        success: {
          DEFAULT: "#b8e354", // Hijau (Selesai)
          foreground: "#0f172a",
        },
        warning: {
          DEFAULT: "#f16504", // Orange (Pending/Action)
          foreground: "#FFFFFF",
        },
        // ---------------------------
        
        surface: "#FFFFFF", // Kartu Putih
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#64748B",
        },
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