const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

// PRODUCTION PLUGINS
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const outputDirectory = 'build';

const isProductionEnv = process.env.NODE_ENV;

const filesToProcess = {
  jsRegex: /\.(js|jsx)$/,
  sassRegex: /\.(scss|sass)$/,
  assetsRegex: /\.(png|woff|woff2|eot|ttf|svg)$/
};

module.exports = {
  mode: isProductionEnv ? 'production' : 'development',
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
      test: filesToProcess.jsRegex,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader'
      }
    },
    {
      test: filesToProcess.sassRegex,
      use: [
        // inproduction extract stylesheets into a dedicated file
        //  outside the bundle.js to avoid render delay
        isProductionEnv
          ? MiniCssExtractPlugin.loader
          : 'style-loader', // 'style-loader': creates style nodes from JS strings
        'css-loader', // translates CSS into CommonJS. Necessary although there aren't .css files
        'sass-loader' // compiles Sass to CSS, using Node Sass by default
      ]
    },
    {
      // 'url-loader': works like 'file' loader except that it embeds assets
      // smaller than specified limit in bytes as data URLs to avoid requests.
      test: filesToProcess.assetsRegex,
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
    }),

    // PRODUCTION PLUGINS
    new MiniCssExtractPlugin({
      filename: 'style.css'
    })
  ]
};
