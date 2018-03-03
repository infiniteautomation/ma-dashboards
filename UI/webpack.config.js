/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    entry: {
        ngMangoServices: './web/ngMango/ngMangoServices.js',
        ngMango: './web/ngMango/ngMangoMaterial.js',
        ui: './web/ui/app.js'
    },
    module: {
        rules: [
            {
                test: /globalize/,
                loader: 'imports-loader?define=>false'
            },
            {
                test: /\.html$/,
                use: [{
                    loader: 'html-loader',
                    options: {
                    }
                }]
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/,
                use: ['file-loader']
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: ['file-loader']
            }
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
    plugins: [
        new CleanWebpackPlugin(['dist'])
    ],
    output: {
        filename: '[name].min.js',
        path: path.resolve(__dirname, 'dist')
    }
};
