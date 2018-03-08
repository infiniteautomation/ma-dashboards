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
                test: /\interpolatedStyles\.css$/,
                use: ['raw-loader']
            },
            {
                test: /\.css$/,
                exclude: /interpolatedStyles\.css/,
                use: [
                    {
                        loader: 'style-loader',
                        options: {
                            insertAt: {
                                before: 'meta[name="user-styles-after-here"]'
                            }
                        }
                    },
                    {
                        loader: 'css-loader'
                    }
                ]
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: 'images/[name].[ext]?v=[hash]'
                    }
                }]
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: 'fonts/[name].[ext]?v=[hash]'
                    }
                }]
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
                test: /md-color-picker.*?\.js/,
                use: ['imports-loader?tinycolor=tinycolor2']
            },
            {
                test: /rql/,
                use: ['imports-loader?define=>undefined']
            },
            {
                test: /angular-material.*?\.js/,
                use: ['imports-loader?angular,angularAnimate=angular-animate,angularAria=angular-aria,angularMessages=angular-messages']
            },
            {
                test: /require\.js/,
                use: ['exports-loader?require,define']
            },
            {
                test: /angular\.js/,
                use: ['imports-loader?windowTemp=>window&windowTemp.jQuery=jquery']
            }
        ]
    },
    resolve: {
        alias: {
            amcharts: path.join(__dirname, 'vendor/amcharts'),
            ace: 'ace-builds',
            localeList: path.join(__dirname, 'vendor/localeList.json'),
            requirejs: 'requirejs/require'
        }
    },
    optimization: {
//        splitChunks: {
//            chunks: 'all'
//        },
//        runtimeChunk: {
//            name: 'manifest'
//        }
    },
    plugins: [
        new CleanWebpackPlugin(['web/dist'])
    ],
    output: {
        filename: '[name].js?v=[chunkhash]',
        path: path.resolve(__dirname, 'web', 'dist'),
        publicPath: '/modules/mangoUI/web/dist/'
    }
};
