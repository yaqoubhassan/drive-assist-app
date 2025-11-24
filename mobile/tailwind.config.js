/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Primary colors
        primary: {
          DEFAULT: "#3B82F6",
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
        // Secondary (Emerald)
        secondary: {
          DEFAULT: "#10B981",
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
        },
        // Accent (Amber)
        accent: {
          DEFAULT: "#F59E0B",
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        },
        // Status colors
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6",
        // Background colors
        background: {
          light: "#FFFFFF",
          dark: "#111827",
        },
        surface: {
          light: "#F9FAFB",
          dark: "#1F2937",
        },
        // Border colors
        border: {
          light: "#E5E7EB",
          dark: "#374151",
        },
      },
      fontFamily: {
        sans: ["System", "sans-serif"],
        display: ["System", "sans-serif"],
      },
      fontSize: {
        "heading-1": ["32px", { lineHeight: "40px", fontWeight: "800" }],
        "heading-2": ["28px", { lineHeight: "36px", fontWeight: "700" }],
        "heading-3": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "heading-4": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "body": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "caption": ["12px", { lineHeight: "16px", fontWeight: "400" }],
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "48px",
      },
      borderRadius: {
        sm: "8px",
        DEFAULT: "12px",
        lg: "16px",
        xl: "24px",
        full: "9999px",
      },
      boxShadow: {
        sm: "0 2px 4px rgba(0,0,0,0.1)",
        DEFAULT: "0 4px 8px rgba(0,0,0,0.12)",
        lg: "0 8px 16px rgba(0,0,0,0.15)",
      },
    },
  },
  plugins: [],
};
