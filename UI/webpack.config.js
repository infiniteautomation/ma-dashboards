/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

const path = require('path');
const webpack = require('webpack');
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
            },
            {
                test: /amcharts.*\.js/,
                use: ['exports-loader?window.AmCharts']
            },
            {
                test: /amcharts.*\.js/,
                use: ['imports-loader?AmCharts=amcharts/amcharts']
            },
            {
                test: /md-color-picker/,
                use: ['imports-loader?tinycolor=tinycolor2']
            },
            {
                test: /rql/,
                use: ['imports-loader?define=>undefined']
            },
            {
                test: /angular-material/,
                use: ['imports-loader?angular,angularAnimate=angular-animate,angularAria=angular-aria,angularMessages=angular-messages']
            },
            {
                test: /require\.js/,
                use: ['exports-loader?require']
            }
        ]
    },
    resolve: {
        alias: {
            amcharts: path.join(__dirname, 'vendor/amcharts'),
            localeList: path.join(__dirname, 'vendor/localeList.json')
        }
    },
//    optimization: {
//        splitChunks: {
//            chunks: 'all'
//        }
//    },
    plugins: [
        new CleanWebpackPlugin(['web/dist'])
    ],
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'web', 'dist'),
        publicPath: '/modules/mangoUI/web/dist/'
    }
};
