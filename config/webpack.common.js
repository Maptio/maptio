var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var helpers = require('./helpers');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const ENV = process.env.NODE_ENV = process.env.ENV = 'development';


module.exports = {
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  entry: {
    'polyfills': './src/app/polyfills.ts',
    'vendor': './src/app/vendor.ts',
    'app': './src/app/bootstrap.ts',
    'app.min': [
      helpers.root('./public/styles/animations.css'),
      helpers.root('./public/styles/global.css'),
      helpers.root('./public/styles/angular-tree-component.css'),
      helpers.root('./public/styles/tooltip.css'),
      helpers.root('./public/styles/breadcrumb.css'),
      helpers.root('./public/styles/tags.css'),
      helpers.root('./public/styles/markdown.css'),
      helpers.root('./public/styles/collapsing.css'),
      helpers.root('./public/styles/progress-bar.css'),
      helpers.root('./public/styles/ribbon.css'),
      helpers.root('./public/styles/progress-pie.css'),
      helpers.root('./public/styles/popover.css'),
      helpers.root('./public/styles/color-picker.css'),
      helpers.root('./public/styles/maps.css')
    ]
  },

  resolve: {
    extensions: ['*', '.ts', '.js']
  },

  module: {
    rules: [
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
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            { loader: 'css-loader', options: { minimize: true } }
          ]
        })
      },
      {
        test: /\.css$/,
        include: helpers.root('src', 'app'),
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
    new webpack.IgnorePlugin(
      //https://medium.com/@ahmedelgabri/analyzing-optimizing-your-webpack-bundle-8590818af4df
      //Used in the slug package ....To comment back if we ever get Arabic or Tibetan users
      /unicode\/category\/So/, /node_modules/
    ),

    new webpack.DefinePlugin({
      'process.env': {
        'ENV': JSON.stringify(ENV)
      }
    }),

    // new ExtractTextPlugin('style.css'),
    new ExtractTextPlugin('app.min.css'),

    new CopyWebpackPlugin([
      { from: 'public/images', to: 'assets/images' },
      { from: 'public/templates', to: 'assets/templates' }
    ]),
    new BundleAnalyzerPlugin({ defaultSizes: 'gzip' })
  ]
};
