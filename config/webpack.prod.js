
var webpackMerge = require('webpack-merge');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var helpers = require('./helpers');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const ngToolsWebpack = require('@ngtools/webpack');
var commonConfig = require('./webpack.common.js');


module.exports = webpackMerge(commonConfig, {
  mode: "production",

  devtool: 'source-map',

  output: {
    path: helpers.root('dist'),
    publicPath: '/',
    filename: '[name].[hash].js',
    chunkFilename: '[id].[hash].chunk.js'
  },


  // entry: {
  //   'vendor': './src/app/vendor.ts',
  //   'polyfills': './src/app/polyfills.ts',
  //   'app': './src/app/bootstrap.ts',
  //   'app.min': [
  //     helpers.root('./public/styles/animations.css'),
  //     helpers.root('./public/styles/global.css'),
  //     helpers.root('./public/styles/angular-tree-component.css'),
  //     helpers.root('./public/styles/tooltip.css'),
  //     helpers.root('./public/styles/breadcrumb.css'),
  //     helpers.root('./public/styles/tags.css'),
  //     helpers.root('./public/styles/markdown.css'),
  //     helpers.root('./public/styles/collapsing.css'),
  //     helpers.root('./public/styles/progress-bar.css'),
  //     helpers.root('./public/styles/ribbon.css'),
  //     helpers.root('./public/styles/progress-pie.css'),
  //     helpers.root('./public/styles/popover.css'),
  //     helpers.root('./public/styles/color-picker.css'),
  //     helpers.root('./public/styles/maps.css')
  //   ]
  // },

  // resolve: {
  //   extensions: ['*', '.ts', '.js']
  // },


  module: {
    rules: [
      {
        test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
        loader: '@ngtools/webpack'
      },
      // {
      //   test: /\.html$/,
      //   loader: 'html-loader'
      // },
      // {
      //   test: /\.(json|png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico|cur)$/,
      //   loader: 'file-loader?name=assets/[name].[hash].[ext]'
      // },
      // {
      //   test: /\.css$/,
      //   exclude: helpers.root('src', 'app'),
      //   use: ExtractTextPlugin.extract({
      //     fallback: 'style-loader',
      //     use: [
      //       { loader: 'css-loader', options: { minimize: true } }
      //     ]
      //   })
      // },
      // {
      //   test: /\.css$/,
      //   include: helpers.root('src', 'app'),
      //   loaders: ['css-to-string-loader', 'css-loader']
      // },
      // {
      //   test: /\.scss$/,
      //   exclude: /node_modules/,
      //   loaders: ['raw-loader', 'sass-loader']
      // },
      // {
      //   test: /\.sass$/,
      //   exclude: /node_modules/,
      //   loaders: ['raw-loader', 'sass-loader']
      // }
    ]
  },

  optimization: {
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 0,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            // get the name. E.g. node_modules/packageName/not/this/part.js
            // or node_modules/packageName
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];

            // npm package names are URL-safe, but some servers don't like @ symbols
            return `npm.${packageName.replace('@', '')}`;
          },
        },
      }
    },
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true
      }),
    ]
  },


  plugins: [
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
    }),
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
    })
  ]
});





