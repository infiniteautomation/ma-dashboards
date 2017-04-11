(function(root) {
'use strict';

var mangoUrl = '';

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

var module = mangoUrl + '/modules/dashboards/web';
var vendor = module + '/vendor';

require.config({
    // set the base url to the old base prefixed by the mango server base url
    baseUrl: mangoUrl + require.toUrl(''),
    paths : {
        'dashboards' : module,
        // The mango-3.0 folder contains the actual 3.0 code, however when 3.1 was released the updated
        // directives and services were placed in the 3.0 folder.
        // Keep the mango-3.0 folder pointing at mango-3.1 to ensure people upgrading from 3.1 are not affected
        'mango-3.0' : module + '/js/mango-3.1',
        'mango-3.1' : module + '/js/mango-3.1',
        'mango-3.2' : module + '/js/mango-3.2',
        'mango-3.3' : module + '/js/mango-3.3',
        'mango-3.5' : module + '/js/mango-3.5',
        'mdAdmin' : module + '/mdAdmin',
        'angular' : vendor + '/angular/angular',
        'angular-route' : vendor + '/angular-route/angular-route',
        'angular-ui-router' : vendor + '/angular-ui-router/angular-ui-router',
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
        'mdPickers': vendor + '/mdPickers/mdPickers',
        'angular-material-data-table': vendor + '/angular-material-data-table/md-data-table',
        'angular-local-storage' : vendor + '/angular-local-storage/angular-local-storage',
        'rql': vendor + '/rql'
    },
    shim : {
        'angular-route' : {
            deps : ['angular']
        },
        'angular-ui-router' : {
            deps : ['angular']
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
        'angular-resource' : {
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
        }
    }
});

})(this);
