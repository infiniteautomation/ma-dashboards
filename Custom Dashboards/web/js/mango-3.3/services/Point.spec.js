/**
 * Copyright (C) 2015 Infinite Automation Systems, Inc. All rights reserved.
 * http://infiniteautomation.com/
 * @author Jared Wiltshire
 * 
 * Mocha test spec, run "npm test" from the root directory to run test
 */

describe('Point service', function() {
    'use strict';

    var mochaConfig = require('../../../../web-test/mocha');
    var cleanupJsDom, injector, Point, $q, $rootScope, user;

    before('Load maServices module', function(done) {
        cleanupJsDom = mochaConfig.initEnvironment(mochaConfig.config.url);
        
        requirejs(['mango-3.3/maServices'], function(maServices) {
            angular.module('PointMockModule', ['maServices', 'ngMockE2E'])
                .constant('mangoBaseUrl', mochaConfig.config.url)
                .constant('mangoTimeout', 5000)
                .config(['$httpProvider', '$exceptionHandlerProvider', function($httpProvider, $exceptionHandlerProvider) {
                    $httpProvider.interceptors.push('mangoHttpInterceptor');
                    $exceptionHandlerProvider.mode('log');
                }])
                .run(['$httpBackend', function($httpBackend) {
                    $httpBackend.whenGET(/.*/).passThrough();
                    $httpBackend.whenPUT(/.*/).passThrough();
                    $httpBackend.whenPOST(/.*/).passThrough();
                    $httpBackend.whenDELETE(/.*/).passThrough();
                }]);
            done();
        });
    });

    after('Clean up environment', function() {
        cleanupJsDom();
    });

    beforeEach('Get injector and dependencies', function() {
        injector = angular.injector(['ng', 'ngMock', 'PointMockModule'], true);
        Point = injector.get('Point');
        $q = injector.get('$q');
        $rootScope = injector.get('$rootScope');
        $rootScope.checkAndDigest = function checkAndDigest() {
            if (!this.$$phase)
                this.$digest();
        };

        var promise;
        if (!user) {
            var promise = injector.get('User')
            .login({
                username: mochaConfig.config.username,
                password: mochaConfig.config.password
            }).$promise
            .then(function(_user) {
                user = _user;
            }, function() {
                throw new Error('Invalid credentials, couldn\'t log in');
            });
            $rootScope.checkAndDigest();
        }
        return promise;
    });
    
    afterEach('Clean up injector', function() {
        mochaConfig.cleanupInjector(injector);
    });

    it('/GET point via xid', function() {
        var promise = Point.get({xid: 'voltage'}).$promise
        .then(function(point) {
            assert.isBoolean(point.enabled);
            assert.property(point, 'templateXid');
            assert.isObject(point.loggingProperties);
            assert.isObject(point.textRenderer);
            assert.property(point, 'chartRenderer');
            assert.equal(point.modelType, 'DATA_POINT');
            assert.isArray(point.validationMessages);
            assert.lengthOf(point.validationMessages, 0);
            assert.isNumber(point.id);
            assert.isAtLeast(point.id, 0);
            assert.isNumber(point.dataSourceId);
            assert.isAtLeast(point.dataSourceId, 0);
            assert.isBoolean(point.useRenderedUnit);
            assert.isBoolean(point.useIntegralUnit);
            assert.isString(point.dataSourceName);
            assert.isString(point.setPermission);
            assert.isString(point.chartColour);
            assert.isBoolean(point.purgeOverride);
            assert.isString(point.plotType);
            assert.isObject(point.purgePeriod);
            assert.isObject(point.pointLocator);
            assert.isString(point.deviceName);
            assert.isString(point.readPermission);
            assert.isNumber(point.pointFolderId);
            assert.isAtLeast(point.pointFolderId, 0);
            assert.property(point, 'integralUnit');
            assert.property(point, 'unit');
            assert.isString(point.name);
            assert.equal(point.xid, 'voltage');
        }, function(error) {
            throw new Error(error.statusText);
        });
        $rootScope.checkAndDigest();
        return promise;
    });
    
    it('/GET non-existing point via xid', function() {
        var promise = Point.get({xid: '003a5f46-b239-4bf4-9a8a-d71643f282db'}).$promise
        .then(function() {
            throw new Error('Shouldn\'t get a point for a random XID');
        }, function(response) {
            assert.equal(response.status, 404);
            return $q.when();
        });
        $rootScope.checkAndDigest();
        return promise;
    });
});
