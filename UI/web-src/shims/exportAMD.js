/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import {require, define} from 'requirejs';
import packageJson from '../../package.json';

window.require = require;
window.requirejs = require;
window.define = define;

const moduleName = packageJson.com_infiniteautomation.moduleName;
const modulePath = `/modules/${moduleName}/web`;
const moduleVersions = {};

const exposedVendorModules = {
    'angular': () => import(/* webpackMode: "eager" */ 'angular'),
    'angular-ui-router': () => import(/* webpackMode: "eager" */ 'angular-ui-router'),
    'angular-ui-sortable': () => import(/* webpackMode: "eager" */ 'angular-ui-sortable'),
    'angular-loading-bar': () => import(/* webpackMode: "eager" */ 'angular-loading-bar'),
    'angular-ui-ace': () => import(/* webpackMode: "eager" */ 'angular-ui-ace'),
    'angular-material': () => import(/* webpackMode: "eager" */ 'angular-material'),
    'angular-animate': () => import(/* webpackMode: "eager" */ 'angular-animate'),
    'angular-messages': () => import(/* webpackMode: "eager" */ 'angular-messages'),
    'angular-aria': () => import(/* webpackMode: "eager" */ 'angular-aria'),
    'angular-resource': () => import(/* webpackMode: "eager" */ 'angular-resource'),
    'angular-sanitize': () => import(/* webpackMode: "eager" */ 'angular-sanitize'),
    'angular-cookies': () => import(/* webpackMode: "eager" */ 'angular-cookies'),
    'moment': () => import(/* webpackMode: "eager" */ 'moment'),
    'moment-timezone': () => import(/* webpackMode: "eager" */ 'moment-timezone'),
    'jquery': () => import(/* webpackMode: "eager" */ 'jquery'),
    'jquery-ui': () => import(/* webpackMode: "eager" */ 'jquery-ui'),
    'jquery-ui-touch-punch': () => import(/* webpackMode: "eager" */ 'jquery-ui-touch-punch-c'),
    'mdPickers': () => import(/* webpackMode: "eager" */ 'md-pickers'),
    'angular-material-data-table': () => import(/* webpackMode: "eager" */ 'angular-material-data-table'),
    'ng-map': () => import(/* webpackMode: "eager" */ 'ngmap'),
    'amcharts/amcharts': () => import(/* webpackMode: "eager" */ 'amcharts/amcharts'),
    'amcharts/funnel': () => import(/* webpackMode: "eager" */ 'amcharts/funnel'),
    'amcharts/gantt': () => import(/* webpackMode: "eager" */ 'amcharts/gantt'),
    'amcharts/gauge': () => import(/* webpackMode: "eager" */ 'amcharts/gauge'),
    'amcharts/pie': () => import(/* webpackMode: "eager" */ 'amcharts/pie'),
    'amcharts/radar': () => import(/* webpackMode: "eager" */ 'amcharts/radar'),
    'amcharts/serial': () => import(/* webpackMode: "eager" */ 'amcharts/serial'),
    'amcharts/xy': () => import(/* webpackMode: "eager" */ 'amcharts/xy'),
    'amcharts/plugins/export/export':  () => import(/* webpackMode: "eager" */ 'amcharts/plugins/export/export'),
    'amcharts/plugins/responsive/responsive':  () => import(/* webpackMode: "eager" */ 'amcharts/plugins/responsive/responsive'),
    'amcharts/plugins/dataloader/dataloader':  () => import(/* webpackMode: "eager" */ 'amcharts/plugins/dataloader/dataloader'),
    'amcharts/plugins/animate/animate':  () => import(/* webpackMode: "eager" */ 'amcharts/plugins/animate/animate'),
    'rql/query': () => import(/* webpackMode: "eager" */ 'rql/query'),
    'rql/parser': () => import(/* webpackMode: "eager" */ 'rql/parser'),
    'tinycolor': () => import(/* webpackMode: "eager" */ 'tinycolor2'),
    'md-color-picker': () => import(/* webpackMode: "eager" */ 'md-color-picker'),
    'sha512': () => import(/* webpackMode: "eager" */ 'js-sha512'),
    'papaparse': () => import(/* webpackMode: "eager" */ 'papaparse'),
    'globalize': () => import(/* webpackMode: "eager" */ 'globalize'),
    'cldr': () => import(/* webpackMode: "eager" */ 'cldrjs'),
//    'cldr-data': () => import(/* webpackMode: "eager" */ 'cldr-data'),
    'ipaddr': () => import(/* webpackMode: "eager" */ 'ipaddr.js'),
    'mathjs': () => import(/* webpackMode: "eager" */ 'mathjs'),
    'simplify-js': () => import(/* webpackMode: "eager" */ 'simplify-js'),
    'jszip': () => import(/* webpackMode: "eager" */ 'jszip'),
    'plotly': () => import(/* webpackMode: "lazy", webpackChunkName: "plotly" */ 'plotly.js'),
    'stacktrace': () => import(/* webpackMode: "eager" */ 'stacktrace-js')
};

const mapToImportPlugin = Object.keys(exposedVendorModules).reduce((map, name) => {
    map[name] = 'import!' + name;
    return map;
}, {});

require.config({
    baseUrl: modulePath + '/vendors',
    urlArgs: function(id, url) {
        if (url.indexOf('?v=') > 0 || url.indexOf('&v=') > 0 || url.match(/^(https?:)?\/\//i)) {
            return '';
        }
        
        let version = window.mangoLastUpgrade || packageJson.version;
        
        const moduleMatches = id.match(/^modules\/(.+?)\//);
        if (moduleMatches) {
            const moduleVersion = moduleVersions[moduleMatches[1]];
            if (moduleVersion) {
                version = moduleVersion;
            }
        }
        
        return (url.indexOf('?') > 0 ? '&' : '?') + 'v=' + version;
    },
    paths : {
        'modules': '/modules',
        'mangoUIModule': modulePath
    },
    map: {
        '*': mapToImportPlugin
    }
});

define('import', [], () => {
    return {
        load(name, req, onload, config) {
            const importFn = exposedVendorModules[name];
            if (typeof importFn !== 'function') {
                // fall back to require()
                req([name], value => {
                    onload(value);
                }, error => {
                    onload.error(error);
                });
                return;
            }

            importFn().then(module => {
                onload(module.default);
            }, error => {
                onload.error(error);
            });
        }
    };
});

export {moduleVersions};
