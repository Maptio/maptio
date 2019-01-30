
var webpackMerge = require('webpack-merge');
var webpack = require('webpack');
var helpers = require('./helpers');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ngToolsWebpack = require('@ngtools/webpack');
var commonConfig = require('./webpack.common.js');
var ExtractTextPlugin = require('extract-text-webpack-plugin');


module.exports = webpackMerge(commonConfig, {
  mode: "production",

  devtool: 'source-map',

  output: {
    path: helpers.root('dist'),
    publicPath: '/',
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].chunk.js'
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
      new TerserPlugin()
    ]
  },


  plugins: [
    new ExtractTextPlugin('[name].[md5:contenthash:hex:20].min.css'),
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





