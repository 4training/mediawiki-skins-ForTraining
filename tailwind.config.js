/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./templates/**/*.{php,html,js,mustache}",
    "./resources/**/*.{php,html,js,mustache}",
    "./extensions/**/*.{php,html,js,mustache}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  fontFamily: {
    sans: ["Graphik", "sans-serif"],
    serif: ["Merriweather", "serif"],
  },
};
