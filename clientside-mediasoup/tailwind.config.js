/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,jsx}",
  'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      animation: {
        'animate-pulse': 'pulse 0.5s cubic-bezier(0.4, 0, 0.6, 1)',
      }
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}
