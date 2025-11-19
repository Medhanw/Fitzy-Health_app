/** @type {import('postcss-load-config').Config} */
export default {
  plugins: {
    // This must be 'tailwindcss', not '@tailwindcss/postcss'
    'tailwindcss': {},
    'autoprefixer': {},
  },
}