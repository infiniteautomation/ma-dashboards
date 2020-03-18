/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const readPom = require('@infinite-automation/mango-module-tools/module-tools/readPom');
const updatePackage = require('@infinite-automation/mango-module-tools/module-tools/updatePackage');
const WorkboxPlugin = require('workbox-webpack-plugin');

const publicPath = '/ui/';

module.exports = readPom().then(pom => {
    return updatePackage(pom);
}).then(packageJson => {
    /*jshint camelcase: false */
    const moduleName = packageJson.com_infiniteautomation.moduleName;
    return {
        // Shim files are a workaround for a bug in webpack (Cannot read property 'call' of undefined - https://github.com/webpack/webpack/issues/959)
        // The bug manifests itself only in production mode when an entry point has no unique code.
        entry: {
            ngMangoServices: './web-src/shims/ngMangoServices.js',
            ngMango: './web-src/shims/ngMango.js',
            mangoUi: './web-src/ui/bootstrap.js'
        },
        module: {
            rules: [
                {
                    test: /\.html$/,
                    use: [{
                        loader: 'html-loader',
                        options: {
                            attrs: ['img:src', 'link:href']
                        }
                    }]
                },
                {
                    test: /\.css$/,
                    exclude: [/[\\/]preBoot\.css$/, /interpolatedStyles\.css$/],
                    use: [
                        {
                            loader: 'style-loader',
                            options: {
                                insert: function(style) {
                                    const meta = document.querySelector('meta[name="user-styles-after-here"]');
                                    meta.parentNode.insertBefore(style, meta);
                                },
                                injectType: 'singletonStyleTag'
                            }
                        },
                        {
                            loader: 'css-loader'
                        }
                    ]
                },
                {
                    test: /\.(png|svg|jpg|jpeg|gif|ico)$/,
                    exclude: /-webfont\.svg$/,
                    use: [{
                        loader: 'file-loader',
                        options: {
                            name: 'img/[name].[ext]?v=[hash]',
                            esModule: false
                        }
                    }]
                },
                {
                    test: /[\\/]ui[\\/]uiSettings\.json$/,
                    type: 'javascript/auto',
                    rules: [
                        {
                            oneOf: [
                                {
                                    resourceQuery: /fileLoader/,
                                    use: [
                                        {
                                            loader: 'file-loader',
                                            options: {
                                                name: '[name].[ext]?v=[hash]',
                                                esModule: false
                                            }
                                        }
                                    ]
                                },
                                {
                                    type: 'json'
                                }
                            ]
                        },
                        {
                            use: [
                                {
                                    loader: 'json-url-loader',
                                    options: {
                                        targets: data => {
                                            const targets = data.pwaManifest.icons.map((icon, i) => `/pwaManifest/icons/${i}/src`);
                                            targets.push('/logoSrc');
                                            return targets;
                                        },
                                        publicPath
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    test: /[\\/]preBoot\.css$/,
                    use: [{
                        loader: 'file-loader',
                        options: {
                            name: 'styles/[name].[ext]?v=[hash]',
                            esModule: false
                        }
                    }]
                },
                {
                    test: /(-webfont\.svg|\.woff|\.woff2|\.eot|\.ttf|\.otf)$/,
                    use: [{
                        loader: 'file-loader',
                        options: {
                            name: 'fonts/[name].[ext]?v=[hash]',
                            esModule: false
                        }
                    }]
                },
                {
                    test: /globalize/,
                    include: /\.js$/,
                    loader: 'imports-loader?define=>false'
                },
                {
                    include: path.resolve(__dirname, 'web-src/vendor/amcharts/amcharts.js'),
                    use: [
                        {
                            loader: 'imports-loader',
                            options: {
                                'windowTemp': '>window',
                                'windowTemp.AmCharts_path': `>'/modules/${moduleName}/web/vendor/amcharts'`,
                            }
                        },
                        'exports-loader?window.AmCharts'
                    ]
                },
                {
                    test: /\.js$/,
                    include: path.resolve(__dirname, 'web-src/vendor/amcharts'),
                    exclude: [
                        path.resolve(__dirname, 'web-src/vendor/amcharts/amcharts.js'),
                        path.resolve(__dirname, 'web-src/vendor/amcharts/plugins/export/libs')
                    ],
                    use: ['imports-loader?AmChartsModule=shims/amcharts,AmCharts=>AmChartsModule.default', 'exports-loader?AmCharts']
                },
                {
                    include: path.resolve(__dirname, 'web-src/vendor/amcharts/gantt.js'),
                    loader: 'imports-loader?AmChartsSerial=amcharts/serial'
                },
                {
                    include: path.resolve(__dirname, 'web-src/vendor/amcharts/plugins/export/export.js'),
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
                    include: path.resolve(__dirname, 'web-src/vendor/amcharts/plugins/export/libs/fabric.js/fabric.js'),
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
                    exclude: /angular-locale.+?\.js$/,
                    use: ['imports-loader?angular']
                },
                {
                    test: /angular-locale.+?\.js$/,
                    use: ['imports-loader?localeCacheModule=angularLocaleCache,angular=>localeCacheModule.default']
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
                    use: ['imports-loader?moment=moment-timezone,angular']
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
                shims: path.join(__dirname, 'web-src/shims'),
                amcharts: path.join(__dirname, 'web-src/vendor/amcharts'),
                localeList: path.join(__dirname, 'web-src/vendor/localeList.json'),
                requirejs: 'requirejs/require',
                ace: path.join(__dirname, 'web-src/shims/ace'),
                angularLocaleCache: path.join(__dirname, 'web-src/shims/angularLocaleCache')
            }
        },
        resolveLoader: {
            alias: {
                'json-url-loader': '@infinite-automation/mango-module-tools/json-url-loader/jsonUrlLoader'
            }
        },
        //devtool: 'eval',
        optimization: {
            //minimize: false,
            splitChunks: {
                chunks: 'all',
                minSize: 30000,
                minChunks: 2,
                maxAsyncRequests: 5,
                maxInitialRequests: 3,
                automaticNameDelimiter: '~',
                name: true,
                cacheGroups: {
//                    vendors: {
//                        test: /[\\/]node_modules[\\/]|[\\/]web-src[\\/]vendor[\\/]/,
//                        priority: -10
//                    },
                    vendors: false,
                }
            }
        },
        plugins: [
            //new webpack.NamedModulesPlugin(),
            new CleanWebpackPlugin({
                cleanStaleWebpackAssets: false
            }),
            new HtmlWebpackPlugin({
                template: 'web-src/ui/index.html',
                filename: 'index.html',
                chunks: ['mangoUi~ngMango~ngMangoServices', 'mangoUi~ngMango', 'mangoUi']
            }),
            new CopyWebpackPlugin([{
                context: 'web-src',
                from: 'vendor/amcharts/+(images|patterns)/**/*'
            }]),
            new CopyWebpackPlugin([{
                context: 'web-src/ui',
                from: 'img/**/*'
            }]),
            new CopyWebpackPlugin([{
                context: 'web-src',
                from: 'img/**/**'
            }]),
            new CopyWebpackPlugin([{
                context: 'web-src/ui',
                from: 'views/examples/layouts/*.html'
            }]),
            new CopyWebpackPlugin([{
                context: 'web-src',
                from: 'configs/**/*'
            }]),
            new WorkboxPlugin.InjectManifest({
                swSrc: 'web-src/ui/serviceWorker.js',
                swDest: 'serviceWorker.js',
                importWorkboxFrom: 'local',
                importsDirectory: 'vendor'
            })
        ],
        output: {
            filename: '[name].js?v=[chunkhash]',
            path: path.resolve(__dirname, 'web'),
            publicPath,
            libraryTarget: 'umd',
            // the library name is used when exporting the library using UMD, it also is appended to the
            // jsonp callback name (unless overridden as below)
            library: '[name]',
            devtoolNamespace: `${moduleName}`, // sets the source map sourceURL
            jsonpFunction: `webpack_jsonp_${moduleName}`
        }
    };
});
