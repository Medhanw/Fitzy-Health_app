/** @type {import('tailwindcss').Config} */
export default {
  // Ensure Tailwind scans all files in the project that use utility classes
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
