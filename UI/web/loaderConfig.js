/**
 * Copyright (C) 2017 Infinite Automation Systems, Inc. All rights reserved.
 * http://infiniteautomation.com/
 * @author Jared Wiltshire
 */

(function(root) {
'use strict';

// when run under node.js (e.g. for testing) we set an explicit path to the UI module
var module = requirejs.uiModulePath;
var mangoUrl = '';

// no explicit module path set on requirejs object, detect base URL and set path
// to Mango's web path for the UI module
if (!module) {
    // finds the script tag used to load the mango core loader config
    // and extracts the mango base url from its src
    var scriptTags = document.getElementsByTagName('script');
    var scriptSuffix = '/modules/mangoUI/web/loaderConfig.js';
    for (var i = scriptTags.length - 1; i >= 0; i--) {
        var script = scriptTags[i];
        var scriptSrc = script.getAttribute('src');
        if (!scriptSrc) continue;
        
        var from = scriptSrc.length - scriptSuffix.length;
        if (scriptSrc.indexOf(scriptSuffix, from) === from) {
            var match = /^(http|https):\/\/.*?(?=\/)/.exec(scriptSrc);
            if (match) mangoUrl = match[0];
            break;
        }
    }
    
    module = mangoUrl + '/modules/mangoUI/web';
}

var vendor = module + '/vendor';

requirejs.config({
    // set the base url to the old base prefixed by the mango server base url
    baseUrl: mangoUrl + requirejs.toUrl(''),
    map: {
        '*': {
            ngMango: 'ngMango-3.0'
        }
    },
    paths : {
        'modules': '/modules',
        'mangoUIModule' : module,
        'ngMango-3.0' : module + '/ngMango-3.0',
        'maUi' : module + '/ui',
        'angular' : vendor + '/angular/angular',
        'angular-ui-router' : vendor + '/angular-ui-router/angular-ui-router',
        'angular-ui-sortable' : vendor + '/angular-ui-sortable/sortable',
        'oclazyload' : vendor + '/oclazyload/ocLazyLoad',
        'angular-loading-bar' : vendor + '/angular-loading-bar/loading-bar',
        'ace' : vendor + '/ace/ace',
        'angular-ui-ace' : vendor + '/angular-ui-ace/ui-ace',
        'angular-material' : vendor + '/angular-material/angular-material',
        'angular-animate' : vendor + '/angular-animate/angular-animate',
        'angular-messages' : vendor + '/angular-messages/angular-messages',
        'angular-aria' : vendor + '/angular-aria/angular-aria',
        'angular-resource' : vendor + '/angular-resource/angular-resource',
        'moment': vendor + '/moment/moment-with-locales',
        'moment-timezone': vendor + '/moment-timezone/moment-timezone-with-data',
        'jquery': vendor + '/jquery/jquery',
        'jquery-ui': vendor + '/jquery-ui/jquery-ui',
        'jquery-ui-touch-punch': vendor + '/jqueryui-touch-punch/jquery.ui.touch-punch',
        'mdPickers': vendor + '/mdPickers/mdPickers',
        'angular-material-data-table': vendor + '/angular-material-data-table/md-data-table',
        'ng-map': vendor + '/ngmap/ng-map',
        'angular-local-storage' : vendor + '/angular-local-storage/angular-local-storage',
        'rql': vendor + '/rql',
        'amcharts' : vendor + '/amcharts',
        // cant use as export.css then maps to export.min.css
        //'amcharts/plugins/export/export': vendor + '/amcharts/plugins/export/export.min',
        'amcharts/plugins/responsive/responsive': vendor + '/amcharts/plugins/responsive/responsive.min',
        'amcharts/plugins/dataloader/dataloader': vendor + '/amcharts/plugins/dataloader/dataloader.min',
        'amcharts/plugins/animate/animate': vendor + '/amcharts/plugins/animate/animate.min',
        'tinycolor' : vendor + '/tinycolor/tinycolor_shim',
        'tinycolor_folder' : vendor + '/tinycolor',
        'md-color-picker' : vendor + '/md-color-picker',
        'sha512' : vendor + '/js-sha512/sha512',
        'papaparse' : vendor + '/papaparse/papaparse',
        'globalize': vendor + '/globalize/globalize',
        'cldr': vendor + '/cldrjs/cldr',
        'cldr-data': vendor + '/cldr-data',
    },
    shim : {
        'angular': {
            deps: ['jquery'],
            init: function() {
                return window.angular;
            }
        },
        'angular-resource': {
            deps: ['angular']
        },
        'angular-route' : {
            deps : ['angular']
        },
        'angular-ui-router' : {
            deps : ['angular']
        },
        'angular-ui-sortable' : {
            deps : ['angular', 'jquery-ui-touch-punch']
        },
        'oclazyload' : {
            deps : ['angular-ui-router']
        },
        'angular-loading-bar' : {
            deps : ['angular']
        },
        'angular-bootstrap' : {
            deps : ['angular', 'bootstrap']
        },
        'metisMenu' : {
            deps : ['jquery']
        },
        'angular-ui-ace' : {
            deps : ['angular', 'ace']
        },
        'angular-material' : {
            deps : ['angular', 'angular-animate', 'angular-aria', 'angular-messages']
        },
        'angular-animate' : {
            deps : ['angular']
        },
        'angular-messages' : {
            deps : ['angular']
        },
        'angular-aria' : {
            deps : ['angular']
        },
        'angular-local-storage' : {
            deps : ['angular']
        },
        'mdPickers': {
            deps: ['moment', 'angular', 'angular-material'],
            init: function(moment) {
                window.moment = moment;
            }
        },
        'angular-material-data-table': {
            deps: ['angular', 'angular-material']
        },
        'jquery-ui': {
            'deps' : ['jquery']
        },
        'jquery-ui-touch-punch': {
            'deps' : ['jquery-ui']
        },
        'md-color-picker/mdColorPicker': {
            deps: ['tinycolor', 'angular', 'angular-material']
        },
        'ng-map': {
            'deps' : ['angular']
        },
        
        /* AmCharts shims */
        
        'amcharts/amcharts': {
            exports: 'AmCharts'
        },
        'amcharts/funnel': {
            deps: ['amcharts/amcharts'],
            exports: 'AmCharts',
            init: function() {
                AmCharts.isReady = true;
            }
        },
        'amcharts/gauge': {
            deps: ['amcharts/amcharts'],
            exports: 'AmCharts',
            init: function() {
                AmCharts.isReady = true;
            }
        },
        'amcharts/pie': {
            deps: ['amcharts/amcharts'],
            exports: 'AmCharts',
            init: function() {
                AmCharts.isReady = true;
            }
        },
        'amcharts/radar': {
            deps: ['amcharts/amcharts'],
            exports: 'AmCharts',
            init: function() {
                AmCharts.isReady = true;
            }
        },
        'amcharts/serial': {
            deps: ['amcharts/amcharts'],
            exports: 'AmCharts',
            init: function() {
                AmCharts.isReady = true;
            }
        },
        'amcharts/xy': {
            deps: ['amcharts/amcharts'],
            exports: 'AmCharts',
            init: function() {
                AmCharts.isReady = true;
            }
        },
        'amcharts/gantt': {
            deps: ['amcharts/serial'],
            exports: 'AmCharts',
            init: function() {
                AmCharts.isReady = true;
            }
        },
        'amcharts/themes/chalk': {
            deps: ['amcharts/amcharts'],
            exports: 'AmCharts',
            init: function() {
                AmCharts.isReady = true;
            }
        },
        'amcharts/themes/light': {
            deps: ['amcharts/amcharts'],
            exports: 'AmCharts',
            init: function() {
                AmCharts.isReady = true;
            }
        },
        'amcharts/themes/dark': {
            deps: ['amcharts/amcharts'],
            exports: 'AmCharts',
            init: function() {
                AmCharts.isReady = true;
            }
        },
        'amcharts/themes/black': {
            deps: ['amcharts/amcharts'],
            exports: 'AmCharts',
            init: function() {
                AmCharts.isReady = true;
            }
        },
        'amcharts/themes/patterns': {
            deps: ['amcharts/amcharts'],
            exports: 'AmCharts',
            init: function() {
                AmCharts.isReady = true;
            }
        },
        'amcharts/plugins/export/export': {
            deps: ['amcharts/amcharts',
                   'amcharts/plugins/export/libs/blob.js/blob',
                   'amcharts/plugins/export/libs/fabric.js/fabric.min',
                   'amcharts/plugins/export/libs/FileSaver.js/FileSaver.min',
                   'amcharts/plugins/export/libs/pdfmake/vfs_fonts',
                   'amcharts/plugins/export/libs/xlsx/xlsx.min']
        },
        'amcharts/plugins/export/libs/pdfmake/vfs_fonts': {
            deps: ['amcharts/plugins/export/libs/pdfmake/pdfmake.min']
        },
        'amcharts/plugins/export/libs/xlsx/xlsx.min': {
            deps: ['amcharts/plugins/export/libs/jszip/jszip_shim']
        },
        'amcharts/plugins/dataloader/dataloader': {
            deps: ['amcharts/amcharts']
        },
        'amcharts/plugins/animate/animate': {
            deps: ['amcharts/amcharts']
        },
        'amcharts/plugins/responsive/responsive': {
            deps: ['amcharts/amcharts']
        }
    }
});

})(this);
