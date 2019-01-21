var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var helpers = require('./helpers');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  entry: {
    'polyfills': './src/app/polyfills.ts',
    'vendor': './src/app/vendor.ts',
    'app': './src/app/bootstrap.ts'
  },

  resolve: {
    extensions: ['.ts', '.js']
  },

  module: {
    rules: [
      // {
      //   test: /\.ts$/,
      //   loaders: ['awesome-typescript-loader', 'angular2-template-loader']
      // },
      {
        test: /\.ts?$/,
        use: [{
          loader: "ts-loader",
          options: {
            transpileOnly: true,
            experimentalWatchApi: true,
          }
        },
        {
          loader: "angular2-template-loader"
        }],
      },
      {
        test: /\.html$/,
        loader: 'html-loader'
      },
      {
        test: /\.(json|png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico|cur)$/,
        loader: 'file-loader?name=assets/[name].[hash].[ext]'
      },
      {
        test: /\.css$/,
        exclude: helpers.root('src', 'app'),
        loaders: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader?sourceMap' })
      },
      {
        test: /\.css$/,
        include: helpers.root('src', 'app'),
        loaders: ['css-to-string-loader', 'css-loader']
      }
    ]
  },

  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          name: 'vendor',
          test: /\/node_modules\//,
          chunks: 'all',
          priority: 0,
          enforce: true,
        },
      }
    }
  },


  plugins: [
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: ['app', 'vendor', 'polyfills']
    // }),
    new webpack.IgnorePlugin(
      //https://medium.com/@ahmedelgabri/analyzing-optimizing-your-webpack-bundle-8590818af4df
      //Used in the slug package ....To comment back if we ever get Arabic or Tibetan users
      /unicode\/category\/So/, /node_modules/
    ),
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),

    new ExtractTextPlugin('style.css'),

    new CopyWebpackPlugin([
      { from: 'public/images', to: 'assets/images' },
      { from: 'public/videos', to: 'assets/videos' },
      { from: 'public/styles', to: 'assets/styles' },
      { from: 'public/templates', to: 'assets/templates' }

    ]),
    new BundleAnalyzerPlugin({ defaultSizes: 'gzip' })
  ]
};
