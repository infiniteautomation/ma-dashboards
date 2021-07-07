/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import {require, define} from 'requirejs';
import packageJson from '../../package.json';

window.require = require;
window.requirejs = require;
window.define = define;

/* jshint camelcase: false */
const moduleName = packageJson.com_infiniteautomation.moduleName;
const modulePath = `/modules/${moduleName}/web`;

const configuration = {
    moduleVersions: {},
    defaultVersion: packageJson.version
};

const exposedVendorModules = {
    'angular': () => import(/* webpackMode: "eager" */ 'angular'),
    'angular-ui-router': () => import(/* webpackMode: "eager" */ 'angular-ui-router'),
    'angular-loading-bar': () => import(/* webpackMode: "eager" */ 'angular-loading-bar'),
    'angular-ui-ace': () => import(/* webpackMode: "lazy", webpackChunkName: "ace" */ 'angular-ui-ace'),
    'angular-material': () => import(/* webpackMode: "eager" */ 'angular-material'),
    'angular-animate': () => import(/* webpackMode: "eager" */ 'angular-animate'),
    'angular-messages': () => import(/* webpackMode: "eager" */ 'angular-messages'),
    'angular-aria': () => import(/* webpackMode: "eager" */ 'angular-aria'),
    'angular-resource': () => import(/* webpackMode: "eager" */ 'angular-resource'),
    'angular-sanitize': () => import(/* webpackMode: "eager" */ 'angular-sanitize'),
    'angular-cookies': () => import(/* webpackMode: "eager" */ 'angular-cookies'),
    'moment': () => import(/* webpackMode: "eager" */ 'moment'),
    'moment-timezone': () => import(/* webpackMode: "eager" */ 'moment-timezone'),
    'mdPickers': () => import(/* webpackMode: "eager" */ 'md-pickers'),
    'angular-material-data-table': () => import(/* webpackMode: "eager" */ 'angular-material-data-table'),
    'amcharts/amcharts': () => import(/* webpackMode: "lazy", webpackChunkName: "amcharts" */ 'amcharts/amcharts'),
    'amcharts/funnel': () => import(/* webpackMode: "lazy", webpackChunkName: "amcharts" */ 'amcharts/funnel'),
    'amcharts/gantt': () => import(/* webpackMode: "lazy", webpackChunkName: "amcharts" */ 'amcharts/gantt'),
    'amcharts/gauge': () => import(/* webpackMode: "lazy", webpackChunkName: "amcharts" */ 'amcharts/gauge'),
    'amcharts/pie': () => import(/* webpackMode: "lazy", webpackChunkName: "amcharts" */ 'amcharts/pie'),
    'amcharts/radar': () => import(/* webpackMode: "lazy", webpackChunkName: "amcharts" */ 'amcharts/radar'),
    'amcharts/serial': () => import(/* webpackMode: "lazy", webpackChunkName: "amcharts" */ 'amcharts/serial'),
    'amcharts/xy': () => import(/* webpackMode: "lazy", webpackChunkName: "amcharts" */ 'amcharts/xy'),
    'amcharts/plugins/export/export':  () => import(/* webpackMode: "lazy", webpackChunkName: "amcharts" */ 'amcharts/plugins/export/export'),
    'amcharts/plugins/responsive/responsive':  () => import(/* webpackMode: "lazy", webpackChunkName: "amcharts" */ 'amcharts/plugins/responsive/responsive'),
    'amcharts/plugins/dataloader/dataloader':  () => import(/* webpackMode: "lazy", webpackChunkName: "amcharts" */ 'amcharts/plugins/dataloader/dataloader'),
    'amcharts/plugins/animate/animate':  () => import(/* webpackMode: "lazy", webpackChunkName: "amcharts" */ 'amcharts/plugins/animate/animate'),
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
    'stacktrace': () => import(/* webpackMode: "eager" */ 'stacktrace-js'),
    'd3': () => import(/* webpackMode: "lazy", webpackChunkName: "d3" */ 'd3')
};

// maps a defined AMD name to the import plugin which loads the resource using ES6/webpack async import()
const mapToImportPlugin = Object.keys(exposedVendorModules).reduce((map, name) => {
    map[name] = 'webpackImport!' + name;
    return map;
}, {});

require.config({
    //baseUrl: modulePath + '/vendors',
    urlArgs: function(id, url) {
        if (url.indexOf('?v=') > 0 || url.indexOf('&v=') > 0 || url.match(/^(https?:)?\/\//i)) {
            return '';
        }
        
        let version = configuration.defaultVersion;
        
        const moduleMatches = id.match(/^modules\/(.+?)\//);
        if (moduleMatches) {
            const moduleVersion = configuration.moduleVersions[moduleMatches[1]];
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

// defines an RequireJS plugin that uses ES6/webpack async import() to load a resource
define('webpackImport', [], () => {
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
                onload(module.default != null ? module.default : module);
            }, error => {
                onload.error(error);
            });
        }
    };
});

export default configuration;
