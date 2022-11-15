module.exports = {
  content: ['./src/index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {}
  },
  variants: {
    extend: {},
    fontFamily: {
      sans: ['Inter', 'ui-sans-serif', 'system-ui']
    }
  },
  plugins: [require('daisyui')],
  daisyui: {
    base: false,
    themes: [
      {
        mine: {
          primary: "#02ec88",
          secondary: "#bf95f9",
          accent: "#dca54c",
          neutral: "#282C34",
          "base-100": "#21252B",
          info: "#3ABFF8",
          success: "#36D399",
          warning: "#FBBD23",
          error: "#F87272",
        },
      },
      "dark",
    ],
  }
};
