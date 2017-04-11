/**
 * Copyright (C) 2015 Infinite Automation Systems, Inc. All rights reserved.
 * http://infiniteautomation.com/
 * @author Jared Wiltshire
 * 
 * Sets up an environment for running mocha tests
 * 
 * This file should be required from *.spec.js files which can be run
 * via "npm test"
 */

var config;
try {
    config = require('./config.json');
} catch (e) {
    config = {};
}

if (config.username == null)
    config.username = 'admin';
if (config.password == null)
    config.password = 'admin';
if (config.url == null)
    config.url = 'http://localhost:8080';

// load requirejs as a global (node has a built in function called require)
global.requirejs = require('requirejs');

// set base URL to core and set node require function for fall back
requirejs.config({
    baseUrl: __dirname + '/../../../ma-core-public/Core/web/resources',
    nodeRequire: require,
    suppress: {
        nodeShim: true
    }
});
// the loaderConfig will use this as the ui module path
requirejs.uiModulePath = __dirname + '/../web';

// load the UI loaderConfig.js so we can locate AMD modules
require('../web/js/loaderConfig.js');
// remove angular from paths so requirejs falls back to node require('angular')
requirejs.config({
    paths: {
        'angular': undefined
    }
});

//load the chai assertion library
global.chai = require('chai');
global.assert = chai.assert;

//load the sinon spying library
global.sinon = require('sinon');

var jsDomGlobal = require('jsdom-global');

function MochaUtils() {

}

MochaUtils.prototype.config = config;

MochaUtils.prototype.initEnvironment = function initEnvironment(useConfigUrl) {
    //sets up a virtual DOM and the window object
    useConfigUrl = useConfigUrl || useConfigUrl == null;
    this.cleanupJsDom = useConfigUrl ? jsDomGlobal(undefined, {url: this.config.url}) : jsDomGlobal();

    // load angular mocks
    require('angular/angular');
    // put angular on global so doing require('angular') doesnt fail
    // angular/index.js tries to export angular not window.angular
    if (!global.angular)
        global.angular = window.angular;
    require('angular-mocks');
};

MochaUtils.prototype.cleanupEnvironment = function cleanupEnvironment() {
    this.cleanupJsDom();
};

MochaUtils.prototype.setInjector = function setInjector(injector) {
    this.injector = injector;
    this.$rootScope = injector.get('$rootScope');
};

// see angular-mocks.js module.$$cleanup()
MochaUtils.prototype.cleanupInjector = function cleanupInjector(injector) {
    injector = injector || this.injector;
    var $rootElement = injector.get('$rootElement');
    var rootNode = $rootElement && $rootElement[0];
    if (rootNode) {
        angular.element.cleanData([rootNode]);
    }
    
    var $rootScope = this.$rootScope || injector.get('$rootScope');
    if ($rootScope && $rootScope.$destroy) $rootScope.$destroy();
    
    // clean up jquery's fragment cache
    angular.forEach(angular.element.fragments, function(val, key) {
      delete angular.element.fragments[key];
    });

    angular.forEach(angular.callbacks, function(val, key) {
      delete angular.callbacks[key];
    });
    angular.callbacks.$$counter = 0;
};

MochaUtils.prototype.login = function login(injector) {
    if (!this.user) {
        var User = this.injector.get('User');
        var username = this.config.username;
        var password = this.config.password;
        
        return User.getCurrent().$promise.then(null, function() {
            return User.login({
                username: username,
                password: password
            }).$promise;
        }).then(function(user) {
            this.user = user;
        }.bind(this), function(error) {
            if (error.status < 0)
                throw new Error('Can\'t connect to Mango API, is Mango running?');
            else if (error.status === 403)
                throw new Error(error.status + ' - ' + error.statusText + ' - Invalid credentials, couldn\'t log in');
            else
                throw new Error(error.status + ' - ' + error.statusText + ' - Error logging in');
        });
    }
}

MochaUtils.prototype.runDigest = function runDigest() {
    if (this.$rootScope && !this.$rootScope.$$phase)
        this.$rootScope.$digest();
};

// angular promises only resolve on digest, and http requests are only flushed on digest
// so we have to run the digest loop after each test
MochaUtils.prototype.runDigestAfter = function runDigestAfter(fn) {
    var runDigest = this.runDigest.bind(this);
    return function() {
        var result = fn.apply(this, arguments);
        setTimeout(runDigest, 0);
        return result;
    };
};

MochaUtils.prototype.getRunDigestAfter = function getRunDigestAfter() {
    return this.runDigestAfter.bind(this);
};

module.exports = MochaUtils;
