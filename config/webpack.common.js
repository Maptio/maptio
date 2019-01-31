var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var helpers = require('./helpers');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin');
var GoogleFontsPlugin = require("@beyonk/google-fonts-webpack-plugin");
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  entry: {
    'polyfills': './src/app/polyfills.ts',
    'vendor': './src/app/vendor.ts',
    'app': './src/app/bootstrap.ts',
  },

  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      'lodash': 'lodash-es',

      /*
Error : "There are multiple modules with names that only differ in casing" created by poor import 
of lodash in @exalif/ngx-breadcrums
'lodash.template': 'lodash-es/template',
    'lodash.templatesettings': 'lodash-es/templatesettings',
      'lodash.templateSettings': 'lodash-es/templatesettings',
      'lodash._reinterpolate': 'lodash-es/_reinterpolate',
      */

      'lodash.includes': 'lodash-es/includes',
      'lodash.isboolean': 'lodash-es/isboolean',
      'lodash.isinteger': 'lodash-es/isinteger',
      'lodash.isnumber': 'lodash-es/isnumber',
      'lodash.isplainobject': 'lodash-es/isplainobject',
      'lodash.isstring': 'lodash-es/isstring',
      'mobx': 'mobx/lib/mobx.module'
    }
  },

  optimization: {
    splitChunks: {
      chunks: 'all',
    },
    runtimeChunk: 'single',
    // splitChunks: {
    //   cacheGroups: {
    //     vendor: {
    //       name: 'vendor',
    //       test: /\/node_modules\//,
    //       chunks: 'all',
    //       priority: 0,
    //       enforce: true
    //     },
    //   }
    // },
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


    new HtmlWebpackPlugin({
      template: './src/index.html',
      minify: {
        removeAttributeQuotes: true,
        collapseWhitespace: true,
        html5: true,
        minifyCSS: true,
        removeComments: true,
        removeEmptyAttributes: true,
      },
      chunksSortMode: "none"
    }),


    new HtmlWebpackExternalsPlugin({

      hash: true,
      externals: [
        {
          module: 'jquery',
          entry: {
            path: 'dist/jquery.min.js'
          },
          global: 'jQuery',

        },
        {
          module: 'popper.js',
          entry: {
            path: 'dist/umd/popper.min.js'
          },
          global: 'popper'
        },
        {
          module: 'bootstrap',
          entry: {
            path: 'dist/js/bootstrap.min.js',

          },
          global: 'bootstrap'
        },
        {
          module: 'marked',
          entry: {
            path: 'marked.min.js'
          },
          global: 'marked'
        },
        {
          module: '@fortawesome',
          entry: 'fontawesome-free/css/all.min.css',
          supplements: ['fontawesome-free/webfonts'],
        }
      ],
    }),

    new GoogleFontsPlugin({
      fonts: [
        { family: "Open Sans", variants: ["400", "600", "700"] },
        { family: "Roboto", variants: ["500"] },
        { family: "Lato", variants: ["400"] },
      ]
    }),

    new webpack.IgnorePlugin(
      //https://medium.com/@ahmedelgabri/analyzing-optimizing-your-webpack-bundle-8590818af4df
      //Used in the slug package ....To comment back if we ever get Arabic or Tibetan users
      /unicode\/category\/So/, /node_modules/
    ),


    new CopyWebpackPlugin([
      { from: 'public/images', to: 'assets/images' },
      { from: 'public/templates', to: 'assets/templates' }
    ])
  ]
};
