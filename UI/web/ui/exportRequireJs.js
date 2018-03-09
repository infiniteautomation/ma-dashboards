/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import {require, define} from 'requirejs';

window.require = require;
window.requirejs = require;
window.define = define;

const modulePath = '/modules/mangoUI/web';

const exposedVendorModules = {
    'angular': () => import('angular'),
    'angular-ui-router': () => import('angular-ui-router'),
    'angular-ui-sortable': () => import('angular-ui-sortable'),
    'angular-loading-bar': () => import('angular-loading-bar'),
    'angular-ui-ace': () => import('angular-ui-ace'),
    'angular-material': () => import('angular-material'),
    'angular-animate': () => import('angular-animate'),
    'angular-messages': () => import('angular-messages'),
    'angular-aria': () => import('angular-aria'),
    'angular-resource': () => import('angular-resource'),
    'angular-sanitize': () => import('angular-sanitize'),
    'angular-cookies': () => import('angular-cookies'),
    'moment': () => import('moment'),
    'moment-timezone': () => import('moment-timezone'),
    'jquery': () => import('jquery'),
    'jquery-ui': () => import('jquery-ui'),
    'jquery-ui-touch-punch': () => import('jquery-ui-touch-punch-c'),
    'mdPickers': () => import('md-pickers'),
    'angular-material-data-table': () => import('angular-material-data-table'),
    'ng-map': () => import('ngmap'),
    'amcharts/amcharts': () => import('amcharts/amcharts'),
    'amcharts/funnel': () => import('amcharts/funnel'),
    'amcharts/gantt': () => import('amcharts/gantt'),
    'amcharts/gauge': () => import('amcharts/gauge'),
    'amcharts/pie': () => import('amcharts/pie'),
    'amcharts/radar': () => import('amcharts/radar'),
    'amcharts/serial': () => import('amcharts/serial'),
    'amcharts/xy': () => import('amcharts/xy'),
    'amcharts/plugins/export/export':  () => import('amcharts/plugins/export/export'),
    'amcharts/plugins/responsive/responsive':  () => import('amcharts/plugins/responsive/responsive'),
    'amcharts/plugins/dataloader/dataloader':  () => import('amcharts/plugins/dataloader/dataloader'),
    'amcharts/plugins/animate/animate':  () => import('amcharts/plugins/animate/animate'),
    'rql/query': () => import('rql/query'),
    'rql/parser': () => import('rql/parser'),
    'tinycolor': () => import('tinycolor2'),
    'md-color-picker': () => import('md-color-picker'),
    'sha512': () => import('js-sha512'),
    'papaparse': () => import('papaparse'),
    'globalize': () => import('globalize'),
    'cldr': () => import('cldrjs'),
//    'cldr-data': () => import('cldr-data'),
    'ipaddr': () => import('ipaddr.js'),
    'mathjs': () => import('mathjs'),
    'simplify-js': () => import('simplify-js'),
    'jszip': () => import('jszip'),
    'plotly': () => import('plotly.js'),
    'stacktrace': () => import('stacktrace-js')
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
        return (url.indexOf('?') > 0 ? '&' : '?') + 'v=' + (window.mangoLastUpgrade || '3.3.0');
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
