
var webpackMerge = require('webpack-merge');
var webpack = require('webpack');
var helpers = require('./helpers');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ngToolsWebpack = require('@ngtools/webpack');
var commonConfig = require('./webpack.common.js');
var MiniCssExtractPlugin = require("mini-css-extract-plugin");

const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

module.exports = webpackMerge(commonConfig, {
  mode: "production",

  devtool: 'source-map',

  output: {
    path: helpers.root('dist'),
    publicPath: '/',
    filename: '[name].[contenthash].min.js',
    chunkFilename: '[name].[contenthash].chunk.min.js'
  },

  module: {
    rules: [
      {
        test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
        loader: '@ngtools/webpack'
      }
    ]
  },

  optimization: {
    minimizer: [
      new TerserPlugin(),
      new OptimizeCSSAssetsPlugin()
    ]
  },


  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash].min.css",
      chunkFilename: "[name].[contenthash].chunk.min.css"
    }),
    new ngToolsWebpack.AngularCompilerPlugin({
      tsConfigPath: helpers.root('tsconfig-aot.json'),
      basePath: helpers.root(''),
      entryModule: helpers.root('src', 'app', 'app.module#AppModule'),
      mainPath: helpers.root('src', 'bootstrap.ts')
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      options: {
        htmlLoader: {
          minimize: false
        }
      }
    })
  ]
});





