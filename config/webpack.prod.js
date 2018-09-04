/**
 * webpack2 config file for ng2 AOT compile
 * location : config/webpack.aot.js
 */
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var helpers = require('./helpers');
var CopyWebpackPlugin = require('copy-webpack-plugin');

const ngToolsWebpack = require('@ngtools/webpack');
const ENV = process.env.NODE_ENV = process.env.ENV = 'production';
// console.log(helpers.root('src', 'app', 'app.module#AppModule'));
module.exports = {
  devtool: 'source-map',
  entry: {
    'vendor': './src/app/vendor.ts',
    'polyfills': './src/app/polyfills.ts',
    'app': './src/app/bootstrap.ts'
  },
  resolve: {
    extensions: ['*', '.ts', '.js']
  },
  output: {
    path: helpers.root('dist'),
    publicPath: '/',
    filename: '[name].[hash].js',
    chunkFilename: '[id].[hash].chunk.js'
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: '@ngtools/webpack'
      },
      {
        test: /\.html$/,
        loader: 'html-loader'
      },
      {
        test: /\.(json|png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico|cur)$/,
        loader: 'file-loader?name=assets/[name].[hash].[ext]'
      },
      // {
      //   test: /\.css$/,
      //   exclude: [helpers.root('src', 'app'), /ngx-color-picker/],
      //   loaders: ExtractTextPlugin.extract({ fallback: 'style-loader', loader: 'css-loader?sourceMap' })
      // },
      {
        test: /\.css$/,
        exclude: [helpers.root('src', 'app'), /ngx-color-picker/],
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            { loader: 'css-loader', options: { minimize: true } }
          ]
        })
      },
      {
        test: /\.css$/,
        include: [helpers.root('src', 'app'), /ngx-color-picker/],
        loaders: ['css-to-string-loader', 'css-loader']
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        loaders: ['raw-loader', 'sass-loader']
      },
      {
        test: /\.sass$/,
        exclude: /node_modules/,
        loaders: ['raw-loader', 'sass-loader']
      }
    ]
  },

  plugins: [
    // If you want to use jquery in ng2 uncomment this
    /*
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    }),*/
    new ngToolsWebpack.AngularCompilerPlugin({
      tsConfigPath: helpers.root('tsconfig-aot.json'),
      basePath: helpers.root(''),
      entryModule: helpers.root('src', 'app', 'app.module#AppModule'),
      mainPath: helpers.root('src', 'bootstrap.ts')
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: ['app', 'vendor', 'polyfills']
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      options: {
        htmlLoader: {
          minimize: false
        }
      }
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      minify: true
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        drop_console: true
      },
      output: {
        comments: false
      }
    }),
    new ExtractTextPlugin('[name].[hash].css'),
    new webpack.DefinePlugin({
      'process.env': {
        'ENV': JSON.stringify(ENV)
      }
    }),
    new CopyWebpackPlugin([
      { from: 'public/images', to: 'assets/images' },
      { from: 'public/styles', to: 'assets/styles' },
      { from: 'public/templates', to: 'assets/templates' }
    ])
  ]
};