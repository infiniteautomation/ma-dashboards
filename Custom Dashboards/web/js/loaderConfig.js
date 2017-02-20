(function(root) {
'use strict';

// when run under node.js (e.g. for testing) we set an explicit path to the dashboard module
var module = requirejs.dashboardModulePath;
var mangoUrl = '';

// no explicit module path set on requirejs object, detect base URL and set path
// to Mango's web path for the dashboard module
if (!module) {
    // finds the script tag used to load the mango core loader config
    // and extracts the mango base url from its src
    var scriptTags = document.getElementsByTagName('script');
    var scriptSuffix = '/resources/loaderConfig.js';
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
    
    module = mangoUrl + '/modules/dashboards/web';
}

var vendor = module + '/vendor';

requirejs.config({
    // set the base url to the old base prefixed by the mango server base url
    baseUrl: mangoUrl + requirejs.toUrl(''),
    paths : {
        'modules': '/modules',
        'dashboards' : module,
        // The mango-3.0 folder contains the actual 3.0 code, however when 3.1 was released the updated
        // directives and services were placed in the 3.0 folder.
        // Keep the mango-3.0 folder pointing at mango-3.1 to ensure people upgrading from 3.1 are not affected
        'mango-3.0' : module + '/js/mango-3.1',
        'mango-3.1' : module + '/js/mango-3.1',
        'mango-3.2' : module + '/js/mango-3.2',
        'mango-3.3' : module + '/js/mango-3.3',
        'mango-3.4' : module + '/js/mango-3.4',
        'mdAdmin' : module + '/mdAdmin',
        'angular' : vendor + '/angular/angular',
        'angular-route' : vendor + '/angular-route/angular-route',
        'angular-ui-router' : vendor + '/angular-ui-router/angular-ui-router',
        'angular-ui-sortable' : vendor + '/angular-ui-sortable/sortable',
        'json3' : vendor + '/json3/json3',
        'oclazyload' : vendor + '/oclazyload/ocLazyLoad',
        'angular-loading-bar' : vendor + '/angular-loading-bar/loading-bar',
        'angular-bootstrap' : vendor + '/angular-bootstrap/ui-bootstrap-tpls',
        'metisMenu' : vendor + '/metisMenu/metisMenu',
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
        'tinycolor' : vendor + '/tinycolor/tinycolor',
        'md-color-picker' : vendor + '/md-color-picker',
        'sha512' : vendor + '/js-sha512/sha512'
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
        }
    }
});

})(this);
