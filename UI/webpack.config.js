/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

const path = require('path');

module.exports = {
    entry: {
        ngMangoServices: './web/ngMango/ngMangoServices.js',
        ngMango: './web/ngMango/ngMangoMaterial.js',
        ui: './web/ui/app.js'
    },
    mode: 'development',
    module: {
        rules: [
            {test: /globalize/, loader: 'imports-loader?define=>false'}
        ]
    },
    resolve: {
        alias: {
            amcharts: path.join(__dirname, 'vendor/amcharts')
        }
    },
    optimization: {
        splitChunks: {
            chunks: 'all'
        }
    },
    output: {
        filename: '[name].min.js',
        path: path.resolve(__dirname, 'dist')
    }
};
