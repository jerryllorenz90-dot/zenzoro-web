module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        neon: "#ff00ff",
        zenblack: "#0a0a0f",
        zendark: "#111118",
        zenpanel: "#1a1a25"
      },
      boxShadow: {
        neon: "0 0 12px #ff00ff, 0 0 24px #ff00ff55",
      }
    }
  },
  plugins: []
};