/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const readPom = require('./readPom');
const updatePackage = require('./updatePackage');

module.exports = (configOptions = {}) => {
    const moduleRoot = configOptions.moduleRoot || path.resolve('.');
    
    return readPom(moduleRoot).then(pom => {
        return updatePackage(pom, moduleRoot);
    }).then(packageJson => {
        const moduleName = packageJson.com_infiniteautomation.moduleName;
        
        const webPackConfig = {
            entry: {
                [moduleName]: `./web-src/${moduleName}.js`
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
                        test: /\.css$/,
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
                        test: /\.(txt|csv)$/,
                        use: [{
                            loader: 'raw-loader'
                        }]
                    }
                ]
            },
            optimization: {
                splitChunks: false
            },
            plugins: [
                new CleanWebpackPlugin(['web/angular'], {
                    root: moduleRoot
                }),
                new CopyWebpackPlugin([{
                    context: 'web-src/static',
                    from: '**/*'
                }])
            ],
            output: {
                filename: '[name].js?v=[chunkhash]',
                path: path.resolve('web', 'angular'),
                publicPath: `/modules/${moduleName}/web/angular/`,
                libraryTarget: 'umd',
                libraryExport: 'default',
                library: moduleName
            },
            externals: {
                'angular': 'angular',
                'cldrjs': 'cldrjs',
                'cldr-data': 'cldr-data',
                'file-saver': 'file-saver',
                'globalize': 'globalize',
                'ipaddr.js': 'ipaddr.js',
                'jquery': 'jquery',
                'js-sha512': 'sha512',
                'jszip': 'jszip',
                'mathjs': 'mathjs',
                'moment': 'moment',
                'moment-timezone': 'moment-timezone',
                'papaparse': 'papaparse',
                'pdfmake': 'pdfmake',
                'plotly.js': 'plotly.js',
                'stacktrace-js': 'stacktrace-js',
                'tinycolor2': 'tinycolor2',
                'xlsx': 'xlsx'
            }
        };
        
        return webPackConfig;
    });
};
