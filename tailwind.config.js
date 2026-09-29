/** @type {import('tailwindcss').Config} */
export default {
  // No darkMode — light theme only
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Inter'", "'Cairo'", "'IBM Plex Sans Arabic'", "system-ui", "sans-serif"],
      },
      colors: {
        // Canvas
        background: "#F6F8FB",
        surface:    "#FFFFFF",
        surface2:   "#F1F5F9",

        // Primary — medical blue
        primary: {
          DEFAULT: "#2563EB",
          dark:    "#1D4ED8",
          light:   "#EFF6FF",
          text:    "#1E40AF",
        },

        // Secondary — health teal
        teal: {
          DEFAULT: "#0D9488",
          dark:    "#0F766E",
          light:   "#F0FDFA",
          text:    "#115E59",
        },

        // Accent — coral CTA
        accent: {
          DEFAULT: "#F97316",
          dark:    "#EA580C",
          light:   "#FFF7ED",
          text:    "#9A3412",
        },

        // Semantic
        success: {
          DEFAULT: "#16A34A",
          light:   "#F0FDF4",
          text:    "#14532D",
        },
        warning: {
          DEFAULT: "#D97706",
          light:   "#FFFBEB",
          text:    "#78350F",
        },
        danger: {
          DEFAULT: "#DC2626",
          light:   "#FEF2F2",
          text:    "#7F1D1D",
        },

        // Text scale
        heading: "#0F172A",
        body:    "#334155",
        muted:   "#64748B",
        subtle:  "#94A3B8",

        // Border
        border: "#E2E8F0",

        // Sidebar (navy)
        navy: {
          DEFAULT: "#0F1F3D",
          700:     "#0A1628",
          active:  "#2563EB",
        },
      },
      borderRadius: {
        sm:   "8px",
        md:   "12px",
        lg:   "16px",
        pill: "999px",
        DEFAULT: "12px",
      },
      boxShadow: {
        sm:   "0 1px 2px rgba(15,31,61,0.04), 0 1px 4px rgba(15,31,61,0.06)",
        md:   "0 4px 12px rgba(15,31,61,0.08), 0 1px 3px rgba(15,31,61,0.04)",
        lg:   "0 8px 24px rgba(15,31,61,0.10), 0 2px 6px rgba(15,31,61,0.06)",
        card: "0 1px 3px rgba(15,31,61,0.06), 0 4px 12px rgba(15,31,61,0.06)",
      },
      backgroundImage: {
        "header-gradient": "linear-gradient(135deg, #EFF6FF 0%, #F0FDFA 100%)",
        "accent-gradient":  "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
        "blue-gradient":    "linear-gradient(135deg, #2563EB 0%, #0D9488 100%)",
      },
      keyframes: {
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        pulseWin: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(74,222,128,0.4)" },
          "50%":      { boxShadow: "0 0 0 8px rgba(74,222,128,0)" },
        },
      },
      animation: {
        shimmer:     "shimmer 1.5s infinite",
        "slide-up":  "slideUp 250ms ease forwards",
        "fade-in":   "fadeIn 200ms ease forwards",
        "pulse-win": "pulseWin 1.5s ease 2",
      },
      fontSize: {
        "2xs": ["10px", { lineHeight: "14px" }],
        xs:    ["12px", { lineHeight: "16px" }],
        sm:    ["13px", { lineHeight: "20px" }],
        base:  ["14px", { lineHeight: "22px" }],
        md:    ["15px", { lineHeight: "24px" }],
        lg:    ["17px", { lineHeight: "26px" }],
        xl:    ["20px", { lineHeight: "28px" }],
        "2xl": ["24px", { lineHeight: "32px" }],
        "3xl": ["30px", { lineHeight: "38px" }],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
