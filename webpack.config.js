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
  imageRegex: /\.(svg|png|jpg|gif)$/
};

module.exports = {
  mode: isProductionEnv ? 'production' : 'development',
  // ----------------------------------------------
  // Entry Points
  // ----------------------------------------------
  // These are the "entry points" to our application and webpack starts bundling.
  // This means they will be the "root" imports that are included in JS bundle.
  // 'babel-polyfill': added to support extended JS features as async/await.
  entry: ['babel-polyfill', './src/client/index.js'],
  // The build folder
  output: {
    path: path.join(__dirname, outputDirectory),
    filename: isProductionEnv ? '[name].bundle.[contenthash].js' : '[name].bundle.js'
  },
  // ----------------------------------------------
  // Resolve
  // ----------------------------------------------
  // Configure how modules are resolved: webpack find the module code that needs
  // to be included in the bundle for every such require/import statement
  // If the path has not a file extension is resolved using the resolve.extensions
  // JSX is included as a common component filename extension to support some tools
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  // ----------------------------------------------
  // Optimization
  // ----------------------------------------------
  optimization: {
    // Minification is 'true' by default in 'production' mode
    minimize: isProductionEnv,
    // Bundle splitting in separated files: main and vendors
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          name: 'vendors',
          test: /[\\/]node_modules[\\/]/
        }
      }
    }
  },
  // ----------------------------------------------
  // Module
  // ----------------------------------------------
  module: {
    // Following, the rules to be executed by order
    // Loaders: transformations that are applied on the source code of a module
    rules: [
      // JS/JSX FILES MANAGEMENT
      // 'babel-loader': Loads ES2015+ code and transpiles to ES5 using Babel
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
      // 'sass-loader': Loads and compiles a SASS/SCSS file, using 'node-sass' by default
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
        test: filesToProcess.imageRegex,
        loader: 'url-loader',
        options: {
          limit: 100000
        }
      }
    ]
  },
  // ----------------------------------------------
  // Plugins
  // ----------------------------------------------
  plugins: [
    // Remove outputDirectory before a new bundle
    new CleanWebpackPlugin([outputDirectory]),
    // Generates an 'index.html' file in output directory based in
    // template file attribute (replaces and improves 'html-loader')
    new HtmlWebpackPlugin({
      inject: false,
      hash: isProductionEnv,
      template: './public/index.html',
      filename: 'index.html',
      favicon: './public/favicon.ico'
    }),

    // PRODUCTION PLUGINS
    // MiniCssExtractPlugin: Extracting CSS into own file (replace extract-text plugin)
    new MiniCssExtractPlugin({
      filename: isProductionEnv ? 'style.[contenthash].css' : 'style.css'
    }),
    // with 'mini-css-extract-plugin' every time you change something in your SCSS,
    // both .js file and .css output files change hashes
    // 'webpack-md5-hash' solves this
    new WebpackMd5Hash()
  ],
  // ----------------------------------------------
  // Devtool
  // ----------------------------------------------
  devServer: {
    port: 3000,
    open: true,
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
};
