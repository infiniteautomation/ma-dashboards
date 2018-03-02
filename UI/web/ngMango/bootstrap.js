/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import requirejs from 'requirejs/require';

if (document.readyState === 'interactive' || document.readyState === 'complete') {
    findMangoConnections();
} else {
    document.addEventListener('DOMContentLoaded', findMangoConnections);
}

function findMangoConnections() {
	var i, connectionElement, mangoConnection;
	var defaultModule = 'ngMango';
	var dependencies = ['angular', './ngMango'];

	var connectionElements = document.querySelectorAll('[ma-app], ma-app');
	for (i = 0; i < connectionElements.length; i++) {
		connectionElement = connectionElements[i];
		mangoConnection = {};
		
		mangoConnection.baseUrl = connectionElement.getAttribute('ma-url') ||
			connectionElement.getAttribute('ma-connection') || '';

		mangoConnection.username = connectionElement.getAttribute('ma-username');
		mangoConnection.password = connectionElement.getAttribute('ma-password');
		var timeout = connectionElement.getAttribute('ma-timeout');
		if (timeout) {
			mangoConnection.timeout = parseInt(timeout, 10);
		}
		var watchdogTimeout = connectionElement.getAttribute('ma-watchdog-timeout');
		if (watchdogTimeout) {
			mangoConnection.watchdogTimeout = parseInt(watchdogTimeout, 10);
		}
		
		var debug = connectionElement.getAttribute('ma-debug');
		mangoConnection.debug = !debug || debug === 'true';
		
        var module = mangoConnection.module = connectionElement.getAttribute('ma-app') || 'ngMangoMaterial';
        dependencies.push('./' + module);
		
		connectionElement.mangoConnection = mangoConnection;
	}
	
	if (!connectionElements.length) {
	    // no ma-app config, load ngMangoMaterial by default
	    defaultModule = 'ngMangoMaterial';
	    dependencies[1] = './ngMangoMaterial';
	}

    // creates config function to white-list remote host so angular can fetch templates from it
    var scriptSourceServer;
	var match = /^(http|https):\/\/.*?(?=\/)/.exec(requirejs.toUrl('./ngMango'));
    if (match) scriptSourceServer = match[0];

    resourceWhitelistConfig.$inject = ['$sceDelegateProvider'];
    function resourceWhitelistConfig($sceDelegateProvider) {
        $sceDelegateProvider.resourceUrlWhitelist([
            'self',
            scriptSourceServer + '/**'
        ]);
    }
    
    disableDebugConfig.$inject = ['$compileProvider'];
    function disableDebugConfig($compileProvider) {
        $compileProvider.debugInfoEnabled(false);
    }

	requirejs(dependencies, function(angular, ngMango) {
		if (!connectionElements.length) {
            var defaultApp = angular.module('ngMangoBootstrapApp', [defaultModule]);
            if (scriptSourceServer) {
                defaultApp.config(resourceWhitelistConfig);
            }
			doBootstrap(document.documentElement, 'ngMangoBootstrapApp');
			return;
		}
		
		for (i = 0; i < connectionElements.length; i++) {
			connectionElement = connectionElements[i];
			mangoConnection = connectionElement.mangoConnection;
			delete connectionElement.mangoConnection;
			
			var servicesAppName = 'ngMangoBootstrapServices' + i;
            var servicesApp = angular.module(servicesAppName, ['ngMangoServices']);
			
			if (mangoConnection.baseUrl)
			    servicesApp.constant('MA_BASE_URL', mangoConnection.baseUrl);
			if (mangoConnection.timeout)
			    servicesApp.constant('MA_TIMEOUT', mangoConnection.timeout);
			if (mangoConnection.watchdogTimeout)
			    servicesApp.constant('MA_WATCHDOG_TIMEOUT', mangoConnection.watchdogTimeout);

            var appName = 'ngMangoBootstrapApp' + i;
            var app = angular.module(appName, [servicesAppName, mangoConnection.module]);
            
            if (!mangoConnection.debug) {
                app.config(disableDebugConfig);
            }
            if (scriptSourceServer) {
                app.config(resourceWhitelistConfig);
            }
			
			if (mangoConnection.username) {
				var injector = angular.injector([servicesAppName], true);
				var User = injector.get('maUser');
				User.login({
					username: mangoConnection.username,
					password: mangoConnection.password
				}).$promise.then(doBootstrap.bind(null, connectionElement, appName));
			} else {
				doBootstrap(connectionElement, appName);
			}
		}

		function doBootstrap(element, appName) {
			angular.bootstrap(element, [appName], {strictDi: true});
		}
	});
}
