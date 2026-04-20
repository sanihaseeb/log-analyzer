/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "monospace"],
      },
      colors: {
        ink: {
          50: "#f6f7f9",
          100: "#e9ecef",
          200: "#c9ced5",
          300: "#9aa3ad",
          400: "#6b7480",
          500: "#4a525c",
          600: "#323941",
          700: "#22272d",
          800: "#161a1e",
          900: "#0c0f12",
        },
      },
    },
  },
  plugins: [],
};
