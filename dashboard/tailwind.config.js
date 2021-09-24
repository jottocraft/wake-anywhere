module.exports = {
  //mode: "jit", //doesn't support create-react-app yet
  purge: {
    content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html', './node_modules/shamrock-ux/react/*.js'],
    options: {
      safelist: [/data-theme/]
    }
  },
  theme: {
    extend: {}
  },
  varients: {
    extend: {}
  },
  presets: [
    require('shamrock-ux/tailwind')({
      colors: {
        ramps: {
          ui: {
            brandElement: {
              light: "#476725",
              dark: "#76b12b"
            },
            brandElementHover: {
              light: "#517529",
              dark: "#6c9f32"
            }
          },
          type: {
            brand: {
              light: "#507820",
              dark: "#72a43a"
            },
            brandElement: {
              light: "#ededed",
              dark: "#112000"
            }
          }
        }
      }
    })
  ]
};