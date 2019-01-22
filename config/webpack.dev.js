var webpackMerge = require('webpack-merge');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var commonConfig = require('./webpack.common.js');
var helpers = require('./helpers');
var path = require('path');
var webpack = require('webpack');

var buildPath = path.resolve(__dirname, 'public', 'build');

// 

module.exports = webpackMerge(commonConfig, {
  mode: "development",

  devtool: 'cheap-module-eval-source-map',

  output: {
    path: buildPath,
    publicPath: '/',
    filename: '[name].js',
    chunkFilename: '[id].chunk.js'
  },

  optimization: {
    noEmitOnErrors: true
  },

  module: {
    rules: [
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

    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    // new webpack.DefinePlugin({
    //   'process.env': {
    //     'ENV': JSON.stringify(ENV)
    //   }
    // }),

    new ExtractTextPlugin('[name].css')
  ],

  devServer: {
    historyApiFallback: true,
    stats: 'minimal'
  }
});
