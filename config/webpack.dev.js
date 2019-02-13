var webpackMerge = require('webpack-merge');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
var MiniCssExtractPlugin = require("mini-css-extract-plugin");

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
    chunkFilename: '[name].chunk.js'
  },

  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
              experimentalWatchApi: true,
            }
          },
          {
            loader: "angular2-template-loader"
          },
          {
            loader: "angular-router-loader"
          }],
      },
    ]
  },

  optimization: {

    noEmitOnErrors: true
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[name].chunk.css"
    }),

    new BundleAnalyzerPlugin({ defaultSizes: 'gzip' })
  ],

  devServer: {
    historyApiFallback: true,
    stats: 'minimal'
  }
});
