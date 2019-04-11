const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const outputDirectory = 'dist';

module.exports = {
  // Where the application starts executing and webpack starts bundling
  // 'babel-polyfill': is added to support extended JS features as async/await
  entry: ['babel-polyfill', './src/client/index.js'],
  // The build folder
  output: {
    path: path.join(__dirname, outputDirectory),
    filename: 'bundle.js'
  },
  module: {
    // Following, the rules to be executed by order
    // Loaders: transformations that are applied on the source code of a module
    rules: [{
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader'
      }
    },
    {
      test: /\.css$/,
      use: ['style-loader', 'css-loader']
    },
    {
      // 'url-loader': works like 'file' loader except that it embeds assets
      // smaller than specified limit in bytes as data URLs to avoid requests.
      test: /\.(png|woff|woff2|eot|ttf|svg)$/,
      loader: 'url-loader',
      options: {
        limit: 100000
      }
    }]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  devServer: {
    port: 3000,
    open: true,
    proxy: {
      '/api': 'http://localhost:8080'
    }
  },
  plugins: [
    // Remove outputDirectory before a new bundle
    new CleanWebpackPlugin([outputDirectory]),
    // Generates an `index.html` file with the <script> injected.
    new HtmlWebpackPlugin({
      template: './public/index.html',
      favicon: './public/favicon.ico'
    })
  ]
};
