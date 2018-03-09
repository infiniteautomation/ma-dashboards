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
                exclude: /interpolatedStyles\.css$/,
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
                test: /globalize/,
                include: /\.js$/,
                loader: 'imports-loader?define=>false'
            },
            {
                test: /amcharts/,
                include: /\.js$/,
                use: ['exports-loader?window.AmCharts', 'imports-loader?AmCharts=amcharts/amcharts']
            },
            {
                test: /md-color-picker/,
                include: /\.js$/,
                use: ['imports-loader?tinycolor=tinycolor2']
            },
            {
                test: /rql/,
                include: /\.js$/,
                use: ['imports-loader?define=>undefined']
            },
            {
                test: /angular-material/,
                include: /\.js$/,
                use: ['imports-loader?angular,angularAnimate=angular-animate,angularAria=angular-aria,angularMessages=angular-messages']
            },
            {
                test: /require\.js/,
                use: ['exports-loader?require,define']
            },
            {
                test: /angular\.js/,
                use: ['imports-loader?windowTemp=>window&windowTemp.jQuery=jquery']
            },
            {
                test: /angular-ui-ace/,
                include: /\.js$/,
                use: ['imports-loader?ace']
            },
            {
                test: /ace-builds/,
                include: /\.js$/,
                use: ['imports-loader?requirejs=>window.requirejs,require=>window.require,define=>window.define']
            }
        ]
    },
    resolve: {
        alias: {
            amcharts: path.join(__dirname, 'vendor/amcharts'),
            localeList: path.join(__dirname, 'vendor/localeList.json'),
            requirejs: 'requirejs/require',
            ace: 'ace-builds'
        }
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                vendor: {
                    test: /node_modules/,
                    name: 'vendor',
                    chunks: 'initial',
                    enforce: true
                }
            }
        },
        runtimeChunk: {
            name: 'manifest'
        }
    },
    plugins: [
        new CleanWebpackPlugin(['web/dist'])
    ],
    output: {
        filename: '[name].js?v=[chunkhash]',
        path: path.resolve(__dirname, 'web', 'dist'),
        publicPath: '/modules/mangoUI/web/dist/',
        libraryTarget: 'umd',
        library: 'mango-ui'
    }
};
