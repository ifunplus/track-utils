const path = require('path');

module.exports = {
  mode:"production",
  entry: './src/index.js',
  output: {
    filename: 'track-utils.min.js',
    path: path.resolve(__dirname, 'dist'),
    clean:true,
    library:{
        commonjs:"track-utils",
        amd:"track-utils",
        root:"trackUtils"
    },
    umdNamedDefine:true,
    libraryTarget:"umd",
    globalObject:"this"
  },
  externals:{

  },
  module:{
      rules:[
          {
              test:/\.js$/,
              exclude:[/node_modules/,/examples/],
              use:{
                  loader:"babel-loader",
                  options:{
                      presets:["@babel/preset-env"]
                  }
              }
          }
      ]
  }
};