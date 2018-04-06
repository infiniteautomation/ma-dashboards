/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const readPom = require('./readPom');
const updatePackage = require('./updatePackage');

module.exports = readPom(__dirname).then(pom => {
    return updatePackage(pom);
}).then(packageJson => {
    return {
        entry: {
            ngMangoServices: './web/ngMango/ngMangoServices.js',
            ngMango: './web/ngMango/ngMangoMaterial.js',
            mangoUi: './web/ui/app.js'
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
                    include: path.resolve(__dirname, 'vendor/amcharts/amcharts.js'),
                    use: [
                        {
                            loader: 'imports-loader',
                            options: {
                                'windowTemp': '>window',
                                'windowTemp.AmCharts_path': `>'/modules/${packageJson.name}/web/dist/vendor/amcharts'`,
                            }
                        },
                        'exports-loader?window.AmCharts'
                    ]
                },
                {
                    test: /\.js$/,
                    include: path.resolve(__dirname, 'vendor/amcharts'),
                    exclude: [
                        path.resolve(__dirname, 'vendor/amcharts/amcharts.js'),
                        path.resolve(__dirname, 'vendor/amcharts/plugins/export/libs')
                    ],
                    use: ['imports-loader?AmCharts=amcharts/amcharts', 'exports-loader?window.AmCharts']
                },
                {
                    include: path.resolve(__dirname, 'vendor/amcharts/plugins/export/export.js'),
                    use: [
                        {
                            loader: 'imports-loader',
                            options: {
                                'windowTemp': '>window',
                                'fileSaver': 'file-saver',
                                'vfs_fonts': 'pdfmake/build/vfs_fonts',
                                'fabricModule': 'amcharts/plugins/export/libs/fabric.js/fabric',
                                'windowTemp.saveAs': '>fileSaver.saveAs',
                                'windowTemp.fabric': '>fabricModule.fabric',
                                'windowTemp.pdfMake': 'pdfmake/build/pdfmake',
                                'windowTemp.pdfMake.vfs': '>vfs_fonts.pdfMake.vfs',
                                'windowTemp.XLSX': 'xlsx/dist/xlsx'
                            }
                        }
                    ]
                },
                {
                    include: path.resolve(__dirname, 'node_modules/xlsx/dist/xlsx.js'),
                    use: [{loader:'imports-loader', options: {JSZipSync: 'xlsx/dist/jszip'}}]
                },
                {
                    include: path.resolve(__dirname, 'vendor/amcharts/plugins/export/libs/fabric.js/fabric.js'),
                    use: [{loader:'imports-loader', options: {require: '>undefined'}}]
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
                    test: /require\.js$/,
                    use: ['exports-loader?require,define']
                },
                {
                    test: /angular\.js$/,
                    use: ['imports-loader?windowTemp=>window,windowTemp.jQuery=jquery']
                },
                {
                    test: /angular-.+?\.js$/,
                    use: ['imports-loader?angular']
                },
                {
                    test: /angular-ui-sortable/,
                    include: /\.js$/,
                    use: [{loader:'imports-loader', options: {
                        jqueryUiTouchPunch: 'jquery-ui-touch-punch-c',
                        jqueryUiSortable: 'jquery-ui/ui/widgets/sortable',
                        jqueryUiDraggable: 'jquery-ui/ui/widgets/draggable'
                    }}]
                },
                {
                    test: /ace-builds/,
                    include: /\.js$/,
                    use: ['imports-loader?requirejs=>window.requirejs,require=>window.require,define=>window.define']
                },
                {
                    test: /jquery-ui/,
                    include: /\.js$/,
                    use: ['imports-loader?jquery']
                },
                {
                    test: /jquery-ui-touch-punch/,
                    include: /\.js$/,
                    use: [{loader:'imports-loader', options: {jqueryUi: 'jquery-ui/ui/widgets/mouse'}}]
                },
                {
                    test: /mdPickers/,
                    include: /\.js$/,
                    use: ['imports-loader?moment=moment-timezone,angular,angularMaterial=angular-material']
                },
                {
                    test: /angular-material-data-table/,
                    include: /\.js$/,
                    use: ['imports-loader?angular,angularMaterial=angular-material']
                },
                {
                    test: /md-color-picker/,
                    include: /\.js$/,
                    use: ['imports-loader?angular,angularMaterial=angular-material,tinycolor=tinycolor2']
                },
                {
                    test: /ng-map/,
                    include: /\.js$/,
                    use: ['imports-loader?angular']
                }
            ]
        },
        resolve: {
            alias: {
                amcharts: path.join(__dirname, 'vendor/amcharts'),
                localeList: path.join(__dirname, 'vendor/localeList.json'),
                requirejs: 'requirejs/require',
                ace: path.join(__dirname, 'web/shims/ace')
            }
        },
        optimization: {
            splitChunks: {
                chunks: 'all'
            }
        },
        plugins: [
            new CleanWebpackPlugin(['web/dist']),
            new CopyWebpackPlugin([{from: 'vendor/amcharts/+(images|patterns)/**/*', to: ''}])
        ],
        output: {
            filename: '[name].js?v=[chunkhash]',
            path: path.resolve(__dirname, 'web', 'dist'),
            publicPath: `/modules/${packageJson.name}/web/dist/`,
            libraryTarget: 'umd',
            //library: '[name]'
            library: packageJson.name
        }
    };
});
