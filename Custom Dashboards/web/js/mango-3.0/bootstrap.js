/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require'], function(require) {
'use strict';

contentLoaded(window, findMangoConnections);

function findMangoConnections() {

	var i, connectionElement, mangoConnection;
	var defaultModule = 'maDashboards';
	var dependencies = ['angular', './maDashboards'];

	var connectionElements = document.querySelectorAll("[ma-app], ma-app");
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
		var logout = connectionElement.getAttribute('ma-logout');
		mangoConnection.logout = logout === null ? false : true;
		
        var module = mangoConnection.module = connectionElement.getAttribute('ma-app') || 'maMaterialDashboards';
        dependencies.push('./' + module);
		
		connectionElement.mangoConnection = mangoConnection;
	}
	
	if (!connectionElements.length) {
	    // no ma-app config, load maMaterialDashboards by default
	    defaultModule = 'maMaterialDashboards';
	    dependencies[1] = './maMaterialDashboards';
	}
	
	var scriptSourceServer;
	var match = /^(http|https):\/\/.*?(?=\/)/.exec(require.toUrl('./maDashboards'));
    if (match) scriptSourceServer = match[0];

	require(dependencies, function(angular, maDashboards) {
	    // white-list remote host so angular can fetch templates from it
	    if (scriptSourceServer) {
	        maDashboards.config(['$sceDelegateProvider', function($sceDelegateProvider) {
	            $sceDelegateProvider.resourceUrlWhitelist([
	                'self',
	                scriptSourceServer + '/**'
	            ]);
	        }]);
	    }
	    
		if (!connectionElements.length) {
			doBootstrap(document.documentElement, defaultModule);
			return;
		}
		
		for (i = 0; i < connectionElements.length; i++) {
			connectionElement = connectionElements[i];
			mangoConnection = connectionElement.mangoConnection;
			delete connectionElement.mangoConnection;
			
			var appName = 'maDashboardsSubModule' + i;
			var app = angular.module(appName, [mangoConnection.module]);
			
			if (mangoConnection.baseUrl)
				app.constant('mangoBaseUrl', mangoConnection.baseUrl);
			if (mangoConnection.timeout)
				app.constant('mangoTimeout', mangoConnection.timeout);
			if (mangoConnection.watchdogTimeout)
				app.constant('mangoWatchdogTimeout', mangoConnection.watchdogTimeout);
			
			if (mangoConnection.username) {
				var injector = angular.injector([appName], true);
				var User = injector.get('User');
				User.login({
					username: mangoConnection.username,
					password: mangoConnection.password,
					logout: mangoConnection.logout
				}).$promise.then(doBootstrap.bind(null, connectionElement, appName));
			} else {
				doBootstrap(connectionElement, appName);
			}
		}
		
		function doBootstrap(element, appName) {
			angular.bootstrap(element, [appName], {strictDi: true});
		}
	}); // define
}

/**
 * DOMContentLoaded shim for old browsers
 * https://github.com/dperini/ContentLoaded/blob/master/src/contentloaded.js
 */
function contentLoaded(win, fn) {
	var done = false, top = true,

	doc = win.document,
	root = doc.documentElement,
	modern = doc.addEventListener,

	add = modern ? 'addEventListener' : 'attachEvent',
	rem = modern ? 'removeEventListener' : 'detachEvent',
	pre = modern ? '' : 'on',

	init = function(e) {
		if (e.type == 'readystatechange' && doc.readyState != 'complete') return;
		(e.type == 'load' ? win : doc)[rem](pre + e.type, init, false);
		if (!done && (done = true)) fn.call(win, e.type || e);
	},

	poll = function() {
		try { root.doScroll('left'); } catch(e) { setTimeout(poll, 50); return; }
		init('poll');
	};

	if (doc.readyState == 'complete') fn.call(win, 'lazy');
	else {
		if (!modern && root.doScroll) {
			try { top = !win.frameElement; } catch(e) { }
			if (top) poll();
		}
		doc[add](pre + 'DOMContentLoaded', init, false);
		doc[add](pre + 'readystatechange', init, false);
		win[add](pre + 'load', init, false);
	}
}

}); // define
