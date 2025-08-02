// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        custom: '#0f2027',
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'), 
  ],
};
