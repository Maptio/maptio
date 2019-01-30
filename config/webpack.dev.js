var webpackMerge = require('webpack-merge');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

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

    noEmitOnErrors: true
  },

  plugins: [
    new BundleAnalyzerPlugin({ defaultSizes: 'gzip' })
  ],

  devServer: {
    historyApiFallback: true,
    stats: 'minimal'
  }
});
