const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

// PRODUCTION PLUGINS
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssNanoPostCSSPlugin = require('cssnano');
const WebpackMd5Hash = require('webpack-md5-hash');

const outputDirectory = 'build';

const isProductionEnv = process.env.NODE_ENV === 'production';

const filesToProcess = {
  jsRegex: /\.(js|jsx)$/,
  sassRegex: /\.(scss|sass)$/,
  assetsRegex: /\.(png|woff|woff2|eot|ttf|svg)$/
};

module.exports = {
  mode: isProductionEnv ? 'production' : 'development',
  // These are the "entry points" to our application and webpack starts bundling.
  // This means they will be the "root" imports that are included in JS bundle.
  // 'babel-polyfill': added to support extended JS features as async/await.
  entry: ['babel-polyfill', './src/client/index.js'],
  // The build folder
  output: {
    path: path.join(__dirname, outputDirectory),
    filename: 'bundle.js'
  },
  module: {
    // Following, the rules to be executed by order
    // Loaders: transformations that are applied on the source code of a module
    rules: [
      // JS/JSX FILES MANAGEMENT
      // 'babel-loader'
      {
        test: filesToProcess.jsRegex,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      // SASSS FILES MANAGEMENT
      // The order of the plugins matters.
      //
      // 'MiniCssExtractPlugin.loader': extract stylesheets into a
      // dedicated file outside the main bundle.js to avoid render delay.
      // 'css-loader': turns CSS into CommonJS (Necessary although there aren't .css files).
      // 'postcss-loader': minify css file using 'cssnano' plugin.
      // 'sass-loader': turns sass into css, using 'node-sass' by default
      {
        test: filesToProcess.sassRegex,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [
                CssNanoPostCSSPlugin()
              ]
            }
          },
          'sass-loader'
        ]
      },
      // ASSETS MANAGEMENT
      // 'url-loader': resolves import/require() on a file into a url
      // and emits the file into the output directory.
      // In the other hand, transforms files into base64 URIs smaller
      // than specified limit in bytes as data URLs to avoid requests.
      {
        test: filesToProcess.assetsRegex,
        loader: 'url-loader',
        options: {
          limit: 100000
        }
      }
    ]
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
    // Generates an 'index.html' file with the <script> injected.
    new HtmlWebpackPlugin({
      inject: false,
      hash: true,
      template: './public/index.html',
      filename: 'index.html',
      favicon: './public/favicon.ico'
    }),

    // PRODUCTION PLUGINS
    // MiniCssExtractPlugin: replace extract-text plugin
    new MiniCssExtractPlugin({
      filename: 'style.css' // style.[contenthash].css
    }),
    // with 'mini-css-extract-plugin' every time you change something in your SCSS,
    // both .js file and .css output files change hashes
    // 'webpack-md5-hash' solves it
    new WebpackMd5Hash()
  ]
};
