const path = require('path'),
  webpack = require('webpack'),
  JavaScriptObfuscator = require('webpack-obfuscator');

module.exports = {
  mode: 'development',
  entry: './src/index.tsx',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new JavaScriptObfuscator({
      rotateUnicodeArray: true
    }, ['bundle.js'])
  ]
};
