'use strict';

const path = require('path');
const webpack = require('webpack');

module.exports = {
    devtool: 'inline-source-map',

      module: {
        preLoaders: [
            { exclude: /node_modules/, loader: 'tslint', test: /\.ts$/ }
        ],
        loaders: [
            { loader: 'raw', test: /\.(css|html)$/ },
            { exclude: /node_modules/, loader: 'ts', test: /\.ts$/ }
        ]
    },

    resolve: {
        extensions: ['', '.js', '.spec'],
        modulesDirectories: ['node_modules'],
        root: path.resolve('.', 'app')
    },

        tslint: {
        emitErrors: true
    }
};
