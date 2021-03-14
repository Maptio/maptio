'use strict';

const path = require('path');
const webpack = require('webpack');

module.exports = {
    devtool: 'inline-source-map',
    module: {
        // preLoaders: [
        //     { exclude: /node_modules/, loader: 'tslint', test: /\.ts$/ }
        // ],
        loaders: [
            { loader: 'raw', test: /\.(css|html)$/ },
            { exclude: /node_modules/, loaders: ['awesome-typescript-loader', 'angular2-template-loader'], test: /\.ts$/ }
        ]
    },
    resolve: {
        extensions: ['', '.js', '.ts'],
        modulesDirectories: ['node_modules'],
        root: path.resolve('.', 'app')
    },
    tslint: {
        emitErrors: true
    }
};