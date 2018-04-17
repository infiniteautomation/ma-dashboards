/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const readPom = require('./readPom');
const updatePackage = require('./updatePackage');

module.exports = readPom().then(pom => {
    return updatePackage(pom);
}).then(packageJson => {
    const moduleName = packageJson.com_infiniteautomation.moduleName;
    return {
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
        plugins: [
            new CleanWebpackPlugin(['web']),
            new CopyWebpackPlugin([{
                from: 'web-src/static/**/*'
            }])
        ],
        output: {
            filename: '[name].js?v=[chunkhash]',
            path: path.resolve('web'),
            publicPath: `/modules/${moduleName}/web/`,
            libraryTarget: 'umd',
            libraryExport: 'default',
            library: moduleName
        },
        externals: {
            'angular': 'angular',
            'jquery': 'jquery',
            'js-sha512': 'sha512'
        }
    };
});
