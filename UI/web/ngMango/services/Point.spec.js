/**
 * Copyright (C) 2015 Infinite Automation Systems, Inc. All rights reserved.
 * http://infiniteautomation.com/
 * @author Jared Wiltshire
 * 
 * Mocha test spec, run "npm test" from the root directory to run test
 */

describe('Point service', function() {
    'use strict';

    var MochaUtils = require('../../../../web-test/mocha');
    var mochaUtils = new MochaUtils();
    var pointValues, Util;
    var runDigestAfter = mochaUtils.getRunDigestAfter();
    var voltagePointId;
    
    var Point, $q, query, PointHierarchy;

    before('Load ngMangoServices module', function(done) {
        this.timeout(5000);
        
        requirejs(['ngMango/ngMangoServices', 'rql/query'], function(ngMangoServices, _query) {
            query = _query;
            
            angular.module('PointMockModule', ['ngMangoServices', 'ngMockE2E'])
                .constant('MA_BASE_URL', mochaUtils.config.url)
                .constant('MA_TIMEOUT', 0)
                .config(['$httpProvider', '$exceptionHandlerProvider', function($httpProvider, $exceptionHandlerProvider) {
                    $httpProvider.interceptors.push('maHttpInterceptor');
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
        
        mochaUtils.initEnvironment();
    });

    after('Clean up environment', function() {
        mochaUtils.cleanupEnvironment();
    });

    beforeEach('Get injector and dependencies', runDigestAfter(function() {
        var injector = angular.injector(['ng', 'ngMock', 'PointMockModule'], true);
        mochaUtils.setInjector(injector);
        Point = injector.get('maPoint');
        $q = injector.get('$q');
        PointHierarchy = injector.get('maPointHierarchy');
        return mochaUtils.login();
    }));
    
    afterEach('Clean up injector', function() {
        mochaUtils.cleanupInjector();
    });

    it('Get point via XID', runDigestAfter(function() {
        return Point.get({xid: 'voltage'}).$promise.then(function(point) {
            checkPoint(point);
            assert.equal(point.xid, 'voltage');
            assert.equal(point.name, 'Voltage');
            assert.equal(point.deviceName, 'Dashboard Demo');
            assert.equal(point.dataSourceName, 'Dashboard Demo');
            voltagePointId = point.id;
        }, function(error) {
            throw new Error(error.status + ' - ' + error.statusText);
        });
    }));
    
    it('Get point via ID', runDigestAfter(function() {
        return Point.getById({id: voltagePointId}).$promise.then(function(point) {
            checkPoint(point);
            assert.equal(point.xid, 'voltage');
            assert.equal(point.id, voltagePointId);
            assert.equal(point.name, 'Voltage');
            assert.equal(point.deviceName, 'Dashboard Demo');
            assert.equal(point.dataSourceName, 'Dashboard Demo');
        }, function(error) {
            throw new Error(error.status + ' - ' + error.statusText);
        });
    }));

    it('Get non-existing point via XID', runDigestAfter(function() {
        return Point.get({xid: '003a5f46-b239-4bf4-9a8a-d71643f282db'}).$promise.then(function() {
            throw new Error('Shouldn\'t get a point for a random XID');
        }, function(response) {
            assert.equal(response.status, 404);
        });
    }));

    it('Query for point on XID', runDigestAfter(function() {
        var q = new query.Query({name: 'eq', args: ['xid', 'voltage']});
        return Point.query({rqlQuery: q.toString()}).$promise.then(function(result) {
            assert.isArray(result);
            assert.equal(result.length, 1);
            assert.equal(result.$total, 1);
            var point = result[0];
            checkPoint(point);
            assert.equal(point.xid, 'voltage');
            assert.equal(point.name, 'Voltage');
            assert.equal(point.deviceName, 'Dashboard Demo');
            assert.equal(point.dataSourceName, 'Dashboard Demo');
        }, function(error) {
            throw new Error(error.status + ' - ' + error.statusText + ' - ' + q.toString());
        });
    }));
    
    it('Query for point on ID', runDigestAfter(function() {
        var q = new query.Query({name: 'eq', args: ['id', voltagePointId]});
        return Point.query({rqlQuery: q.toString()}).$promise.then(function(result) {
            assert.isArray(result);
            assert.equal(result.length, 1);
            assert.equal(result.$total, 1);
            var point = result[0];
            checkPoint(point);
            assert.equal(point.xid, 'voltage');
            assert.equal(point.id, voltagePointId);
            assert.equal(point.name, 'Voltage');
            assert.equal(point.deviceName, 'Dashboard Demo');
            assert.equal(point.dataSourceName, 'Dashboard Demo');
        }, function(error) {
            throw new Error(error.status + ' - ' + error.statusText + ' - ' + q.toString());
        });
    }));

    it('Limit query to zero results', runDigestAfter(function() {
        var q = new query.Query()
            .eq('xid', 'voltage')
            .limit(0);
        return Point.query({rqlQuery: q.toString()}).$promise.then(function(result) {
            assert.isArray(result);
            assert.equal(result.length, 0);
            assert.equal(result.$total, 1);
        }, function(error) {
            throw new Error(error.status + ' - ' + error.statusText + ' - ' + q.toString());
        });
    }));
    
    it('Limit query to one and offset by one', runDigestAfter(function() {
        var q = new query.Query()
            .eq('xid', 'voltage')
            .limit(1, 1);
        return Point.query({rqlQuery: q.toString()}).$promise.then(function(result) {
            assert.isArray(result);
            assert.equal(result.length, 0);
            assert.equal(result.$total, 1);
        }, function(error) {
            throw new Error(error.status + ' - ' + error.statusText + ' - ' + q.toString());
        });
    }));
    
    it('Query by data source name', runDigestAfter(function() {
        var q = new query.Query()
            .eq('dataSourceName', 'Dashboard Demo');
        return Point.query({rqlQuery: q.toString()}).$promise.then(function(result) {
            assert.isArray(result);
            assert.equal(result.length, 5);
            assert.equal(result.$total, 5);
            angular.forEach(result, function(point) {
                checkPoint(point);
            });
        }, function(error) {
            throw new Error(error.status + ' - ' + error.statusText + ' - ' + q.toString());
        });
    }));
    
    it('Query by data source xid', runDigestAfter(function() {
        var q = new query.Query()
            .eq('dataSourceXid', 'DS_997094');
        return Point.query({rqlQuery: q.toString()}).$promise.then(function(result) {
            assert.isArray(result);
            assert.equal(result.length, 5);
            assert.equal(result.$total, 5);
            angular.forEach(result, function(point) {
                checkPoint(point);
            });
        }, function(error) {
            throw new Error(error.status + ' - ' + error.statusText + ' - ' + q.toString());
        });
    }));

    it('Query by data source name, limit and offset', runDigestAfter(function() {
        var q = new query.Query()
            .eq('dataSourceName', 'Dashboard Demo')
            .limit(3, 2);
        return Point.query({rqlQuery: q.toString()}).$promise.then(function(result) {
            assert.isArray(result);
            assert.equal(result.length, 3);
            assert.equal(result.$total, 5);
            angular.forEach(result, function(point) {
                checkPoint(point);
            });
        }, function(error) {
            throw new Error(error.status + ' - ' + error.statusText + ' - ' + q.toString());
        });
    }));
    
    it('Query by data source name, offset so results are limited', runDigestAfter(function() {
        var q = new query.Query()
            .eq('dataSourceName', 'Dashboard Demo')
            .limit(100, 3);
        return Point.query({rqlQuery: q.toString()}).$promise.then(function(result) {
            assert.isArray(result);
            assert.equal(result.length, 2);
            assert.equal(result.$total, 5);
            angular.forEach(result, function(point) {
                checkPoint(point);
            });
        }, function(error) {
            throw new Error(error.status + ' - ' + error.statusText + ' - ' + q.toString());
        });
    }));
    
    it('Query by data source name, offset so no results returned', runDigestAfter(function() {
        var q = new query.Query()
            .eq('dataSourceName', 'Dashboard Demo')
            .limit(100, 10);
        return Point.query({rqlQuery: q.toString()}).$promise.then(function(result) {
            assert.isArray(result);
            assert.equal(result.length, 0);
            assert.equal(result.$total, 5);
        }, function(error) {
            throw new Error(error.status + ' - ' + error.statusText + ' - ' + q.toString());
        });
    }));
    
    it('Query by data source XID and device name', runDigestAfter(function() {
        var q = new query.Query()
            .eq('dataSourceXid', 'vmeters')
            .eq('deviceName', 'Meter 1');
        return Point.query({rqlQuery: q.toString()}).$promise.then(function(result) {
            assert.isArray(result);
            assert.equal(result.length, 13);
            assert.equal(result.$total, 13);
            angular.forEach(result, function(point) {
                checkPoint(point);
            });
        }, function(error) {
            throw new Error(error.status + ' - ' + error.statusText + ' - ' + q.toString());
        });
    }));
    
    it('Query by data source XID and multiple device names using IN', runDigestAfter(function() {
        var q = new query.Query()
            .eq('dataSourceXid', 'vmeters')
            ['in']('deviceName', 'Meter 1', 'Meter 2');
        return Point.query({rqlQuery: q.toString()}).$promise.then(function(result) {
            assert.isArray(result);
            assert.equal(result.length, 26);
            assert.equal(result.$total, 26);
            angular.forEach(result, function(point) {
                checkPoint(point);
            });
        }, function(error) {
            throw new Error(error.status + ' - ' + error.statusText + ' - ' + q.toString());
        });
    }));
    
    it('Query by data source XID and multiple device names using OR', runDigestAfter(function() {
        var orPart = new query.Query()
            .eq('deviceName', 'Meter 1')
            .eq('deviceName', 'Meter 2');
        orPart.name = 'or';
        
        var q = new query.Query()
            .eq('dataSourceXid', 'vmeters')
            .push(orPart);
        
        return Point.query({rqlQuery: q.toString()}).$promise.then(function(result) {
            assert.isArray(result);
            assert.equal(result.length, 26);
            assert.equal(result.$total, 26);
            angular.forEach(result, function(point) {
                checkPoint(point);
            });
        }, function(error) {
            throw new Error(error.status + ' - ' + error.statusText + ' - ' + q.toString());
        });
    }));
    
    it('Query with root OR term', runDigestAfter(function() {
        var queryDs1 = new query.Query()
            .eq('dataSourceXid', 'vmeters')
            .eq('deviceName', 'Meter 1');

        var queryDs2 = new query.Query()
            .eq('dataSourceXid', 'DS_997094')
            .eq('name', 'Voltage');
        
        var q = new query.Query({name: 'or', args: [queryDs1, queryDs2]});
        
        return Point.query({rqlQuery: q.toString()}).$promise.then(function(result) {
            assert.isArray(result);
            assert.equal(result.length, 14);
            assert.equal(result.$total, 14);
            angular.forEach(result, function(point) {
                checkPoint(point);
            });
        }, function(error) {
            throw new Error(error.status + ' - ' + error.statusText + ' - ' + q.toString());
        });
    }));
    
    it('Query with root OR term and nested OR term', runDigestAfter(function() {
        var orPart = new query.Query()
            .eq('deviceName', 'Meter 1')
            .eq('deviceName', 'Meter 2');
        orPart.name = 'or';
        
        var queryDs1 = new query.Query()
            .eq('dataSourceXid', 'vmeters')
            .push(orPart);

        var queryDs2 = new query.Query()
            .eq('dataSourceXid', 'DS_997094')
            .eq('name', 'Voltage');
        
        var q = new query.Query({name: 'or', args: [queryDs1, queryDs2]});
        
        return Point.query({rqlQuery: q.toString()}).$promise.then(function(result) {
            assert.isArray(result);
            assert.equal(result.length, 27);
            assert.equal(result.$total, 27);
            angular.forEach(result, function(point) {
                checkPoint(point);
            });
        }, function(error) {
            throw new Error(error.status + ' - ' + error.statusText + ' - ' + q.toString());
        });
    }));

    it('Query for enabled points using \'Y\'', runDigestAfter(function() {
        var q = new query.Query()
            .eq('dataSourceXid', 'DS_997094')
            .eq('enabled', 'Y');
        return Point.query({rqlQuery: q.toString()}).$promise.then(function(result) {
            assert.isArray(result);
            assert.equal(result.length, 4);
            assert.equal(result.$total, 4);
            angular.forEach(result, function(point) {
                checkPoint(point);
            });
        }, function(error) {
            throw new Error(error.status + ' - ' + error.statusText + ' - ' + q.toString());
        });
    }));
    
    it('Query for enabled points using \'true\'', runDigestAfter(function() {
        var q = new query.Query()
            .eq('dataSourceXid', 'DS_997094')
            .eq('enabled', 'true');
        return Point.query({rqlQuery: q.toString()}).$promise.then(function(result) {
            assert.isArray(result);
            assert.equal(result.length, 4);
            assert.equal(result.$total, 4);
            angular.forEach(result, function(point) {
                checkPoint(point);
            });
        }, function(error) {
            throw new Error(error.status + ' - ' + error.statusText + ' - ' + q.toString());
        });
    }));
    
    it('Query for enabled points using true', runDigestAfter(function() {
        var q = new query.Query()
            .eq('dataSourceXid', 'DS_997094')
            .eq('enabled', true);
        return Point.query({rqlQuery: q.toString()}).$promise.then(function(result) {
            assert.isArray(result);
            assert.equal(result.length, 4);
            assert.equal(result.$total, 4);
            angular.forEach(result, function(point) {
                checkPoint(point);
            });
        }, function(error) {
            throw new Error(error.status + ' - ' + error.statusText + ' - ' + q.toString());
        });
    }));
    
    it('Query for enabled points using \'N\'', runDigestAfter(function() {
        var q = new query.Query()
            .eq('dataSourceXid', 'DS_997094')
            .eq('enabled', 'N');
        return Point.query({rqlQuery: q.toString()}).$promise.then(function(result) {
            assert.isArray(result);
            assert.equal(result.length, 1);
            assert.equal(result.$total, 1);
            angular.forEach(result, function(point) {
                checkPoint(point);
            });
        }, function(error) {
            throw new Error(error.status + ' - ' + error.statusText + ' - ' + q.toString());
        });
    }));
    
    it('Query for enabled points using \'false\'', runDigestAfter(function() {
        var q = new query.Query()
            .eq('dataSourceXid', 'DS_997094')
            .eq('enabled', 'false');
        return Point.query({rqlQuery: q.toString()}).$promise.then(function(result) {
            assert.isArray(result);
            assert.equal(result.length, 1);
            assert.equal(result.$total, 1);
            angular.forEach(result, function(point) {
                checkPoint(point);
            });
        }, function(error) {
            throw new Error(error.status + ' - ' + error.statusText + ' - ' + q.toString());
        });
    }));
    
    it('Query for enabled points using false', runDigestAfter(function() {
        var q = new query.Query()
            .eq('dataSourceXid', 'DS_997094')
            .eq('enabled', false);
        return Point.query({rqlQuery: q.toString()}).$promise.then(function(result) {
            assert.isArray(result);
            assert.equal(result.length, 1);
            assert.equal(result.$total, 1);
            angular.forEach(result, function(point) {
                checkPoint(point);
            });
        }, function(error) {
            throw new Error(error.status + ' - ' + error.statusText + ' - ' + q.toString());
        });
    }));

    it('Sort by point name', runDigestAfter(function() {
        var q = new query.Query()
            .eq('dataSourceXid', 'DS_997094')
            .sort('name');
        return Point.query({rqlQuery: q.toString()}).$promise.then(function(result) {
            assert.isArray(result);
            assert.equal(result.length, 5);
            assert.equal(result.$total, 5);
            angular.forEach(result, function(point) {
                checkPoint(point);
            });
            assert.equal(result[0].name, 'Binary');
            assert.equal(result[4].name, 'Voltage');
        }, function(error) {
            throw new Error(error.status + ' - ' + error.statusText + ' - ' + q.toString());
        });
    }));
    
    it('Sort by point name descending', runDigestAfter(function() {
        var q = new query.Query()
            .eq('dataSourceXid', 'DS_997094')
            .sort('-name');
        return Point.query({rqlQuery: q.toString()}).$promise.then(function(result) {
            assert.isArray(result);
            assert.equal(result.length, 5);
            assert.equal(result.$total, 5);
            angular.forEach(result, function(point) {
                checkPoint(point);
            });
            assert.equal(result[0].name, 'Voltage');
            assert.equal(result[4].name, 'Binary');
        }, function(error) {
            throw new Error(error.status + ' - ' + error.statusText + ' - ' + q.toString());
        });
    }));
    
    it('Sort all by device name then point name, limit 200', runDigestAfter(function() {
        this.timeout(30000);
        var q = new query.Query()
            .sort('deviceName', 'name')
            .limit(200);
        return Point.query({rqlQuery: q.toString()}).$promise.then(function(result) {
            assert.isArray(result);
            angular.forEach(result, function(point) {
                checkPoint(point);
            });
        }, function(error) {
            throw new Error(error.status + ' - ' + error.statusText + ' - ' + q.toString());
        });
    }));
    
    it('Sort all by descending device name then point name, limit 200', runDigestAfter(function() {
        this.timeout(30000);
        var q = new query.Query()
            .sort('-deviceName', 'name')
            .limit(200);
        return Point.query({rqlQuery: q.toString()}).$promise.then(function(result) {
            assert.isArray(result);
            angular.forEach(result, function(point) {
                checkPoint(point);
            });
        }, function(error) {
            throw new Error(error.status + ' - ' + error.statusText + ' - ' + q.toString());
        });
    }));

    it('Sort all by xid then point name, limit 200', runDigestAfter(function() {
        this.timeout(30000);
        var q = new query.Query()
            .sort('xid', 'name')
            .limit(200);
        return Point.query({rqlQuery: q.toString()}).$promise.then(function(result) {
            assert.isArray(result);
            angular.forEach(result, function(point) {
                checkPoint(point);
            });
        }, function(error) {
            throw new Error(error.status + ' - ' + error.statusText + ' - ' + q.toString());
        });
    }));

    it('Sort by device name then point name, where DS = vmeters', runDigestAfter(function() {
        this.timeout(5000);
        var q = new query.Query()
            .eq('dataSourceXid', 'vmeters')
            .sort('deviceName', 'name');
        return Point.query({rqlQuery: q.toString()}).$promise.then(function(result) {
            assert.isArray(result);
            assert.equal(result.length, 39);
            assert.equal(result.$total, 39);
            angular.forEach(result, function(point) {
                checkPoint(point);
            });
            assert.equal(result[0].name, 'Current Phase A (A)');
            assert.equal(result[0].deviceName, 'Meter 1');
            assert.equal(result[38].name, 'Voltage C-N (V)');
            assert.equal(result[38].deviceName, 'Meter 3');
        }, function(error) {
            throw new Error(error.status + ' - ' + error.statusText + ' - ' + q.toString());
        });
    }));
    
    it('Sort by descending device name then point name, where DS = vmeters', runDigestAfter(function() {
        var q = new query.Query()
            .eq('dataSourceXid', 'vmeters')
            .sort('-deviceName', 'name');
        return Point.query({rqlQuery: q.toString()}).$promise.then(function(result) {
            assert.isArray(result);
            assert.equal(result.length, 39);
            assert.equal(result.$total, 39);
            angular.forEach(result, function(point) {
                checkPoint(point);
            });
            assert.equal(result[0].name, 'Current Phase A (A)');
            assert.equal(result[0].deviceName, 'Meter 3');
            assert.equal(result[38].name, 'Voltage C-N (V)');
            assert.equal(result[38].deviceName, 'Meter 1');
        }, function(error) {
            throw new Error(error.status + ' - ' + error.statusText + ' - ' + q.toString());
        });
    }));
    
    it('Sort by data source XID', runDigestAfter(function() {
        this.timeout(30000);
        var q = new query.Query()
            .sort('dataSourceXid')
            .limit(10);
        return Point.query({rqlQuery: q.toString()}).$promise.then(function(result) {
            assert.isArray(result);
            assert.equal(result.length, 10);
            angular.forEach(result, function(point) {
                checkPoint(point);
            });
        }, function(error) {
            throw new Error(error.status + ' - ' + error.statusText + ' - ' + q.toString());
        });
    }));
    
    it('Sort by data source name', runDigestAfter(function() {
        this.timeout(30000);
        var q = new query.Query()
            .sort('dataSourceName')
            .limit(10);
        return Point.query({rqlQuery: q.toString()}).$promise.then(function(result) {
            assert.isArray(result);
            assert.equal(result.length, 10);
            angular.forEach(result, function(point) {
                checkPoint(point);
            });
        }, function(error) {
            throw new Error(error.status + ' - ' + error.statusText + ' - ' + q.toString());
        });
    }));

    var demoFolder;
    it('Get "Demo" folder (not a point test but required for next test)', runDigestAfter(function() {
        this.timeout(10000);
        return PointHierarchy.byName({name: 'Demo'}).$promise.then(function(folder) {
            demoFolder = folder;
        }, function(error) {
            throw new Error(error.status + ' - ' + error.statusText + ' - Error retrieving point hierarchy folder "Demo"');
        });
    }));
    
    it('Query for points in "Demo" folder', runDigestAfter(function() {
        var q = new query.Query()
            .eq('pointFolderId', demoFolder.id)
            .limit(1);
        return Point.query({rqlQuery: q.toString()}).$promise.then(function(result) {
            assert.isArray(result);
            assert.equal(result.length, 1);
            assert.equal(result.$total, 5);
            checkPoint(result[0]);
            assert.equal(result[0].pointFolderId, demoFolder.id);
        }, function(error) {
            throw new Error(error.status + ' - ' + error.statusText + ' - ' + q.toString());
        });
    }));
    
    it('Search using like and wildcards on name and device name - used on data point details page', runDigestAfter(function() {
        this.timeout(10000);
        var queryString = 'or(name=like=*Meter%203*,deviceName=like=*Meter%203*)&sort(deviceName,name)&limit(150)';
        return Point.query({rqlQuery: queryString}).$promise.then(function(result) {
            assert.isArray(result);
            assert.equal(result.length, 13);
            assert.equal(result.$total, 13);
            angular.forEach(result, function(point) {
                checkPoint(point);
            });
        }, function(error) {
            throw new Error(error.status + ' - ' + error.statusText + ' - ' + queryString);
        });
    }));

    it('Query on non-existing property', runDigestAfter(function() {
        var q = new query.Query({name: 'eq', args: ['xyz', 'blah']});
        return Point.query({rqlQuery: q.toString()}).$promise.then(function(result) {
            throw new Error('Returned successful result for invalid query');
        }, function(error) {
            assert.equal(error.status, 500);
            assert.isObject(error.data);
            assert.equal(error.data.localizedMessage, 'com.serotonin.ShouldNeverHappenException: No column found for: xyz');
        });
    }));
    
    it('Sort on non-existing property', runDigestAfter(function() {
        var q = new query.Query({name: 'sort', args: ['xyz']});
        return Point.query({rqlQuery: q.toString()}).$promise.then(function(result) {
            throw new Error('Returned successful result for invalid query');
        }, function(error) {
            assert.equal(error.status, 500);
            assert.isObject(error.data);
            assert.equal(error.data.localizedMessage, 'com.serotonin.ShouldNeverHappenException: No column found for: xyz');
        });
    }));

    var createdPointXid;
    
    it('Create point', runDigestAfter(function() {
        var point = new Point();
        point.name = 'temporary test point';
        //point.xid = 'temp_test_point';
        point.dataSourceXid = 'DS_997094';
        point.deviceName = 'Dashboard Demo';
        point.pointLocator = {
            modelType: 'PL.VIRTUAL',
            changeType: 'NO_CHANGE',
            startValue: '0',
            dataType: 'BINARY'
        };
        
        return point.$save().then(function(point) {
            createdPointXid = point.xid;
            checkPoint(point);
            assert.equal(point.name, 'temporary test point');
            assert.equal(point.deviceName, 'Dashboard Demo');
            assert.equal(point.dataSourceXid, 'DS_997094');
            assert.equal(point.dataSourceName, 'Dashboard Demo');
            return Point.get({xid: createdPointXid}).$promise;
        }, function(error) {
            throw new Error(error.status + ' - ' + error.statusText);
        });
    }));
    
    it('Update created point', runDigestAfter(function() {
        return Point.get({xid: createdPointXid}).$promise.then(function(point) {
            point.name = 'temporary test point updated';
            // hack to get this to work, bug when startValue property is before changeType property
            point.pointLocator = {
                modelType: 'PL.VIRTUAL',
                changeType: 'NO_CHANGE',
                startValue: '0',
                dataType: 'BINARY'
            };

            return point.$update().then(function(point) {
                //checkPoint(point);
                //assert.equal(point.name, 'temporary test point updated');
                //assert.equal(point.deviceName, 'Dashboard Demo');
                //assert.equal(point.dataSourceXid, 'DS_997094');
                
                return Point.get({xid: createdPointXid}).$promise.then(function() {
                    //checkPoint(point);
                    assert.equal(point.name, 'temporary test point updated');
                    //assert.equal(point.deviceName, 'Dashboard Demo');
                    //assert.equal(point.dataSourceXid, 'DS_997094');
                    //assert.equal(point.dataSourceName, 'Dashboard Demo');
                }, function() {
                    throw new Error(error.status + ' - ' + error.statusText + ' - Couldn\'t get updated point');
                });
            }, function(error) {
                if (error instanceof Error) return $q.reject(error);
                throw new Error(error.status + ' - ' + error.statusText);
            });
        }, function(error) {
            if (error instanceof Error) return $q.reject(error);
            throw new Error(error.status + ' - ' + error.statusText + ' - Couldn\'t get created point');
        });
    }));

    it('Delete created point', runDigestAfter(function() {
        if (!createdPointXid) {
            throw new Error('Can\'t perform test, point was not created');
        }
        return Point['delete']({xid: createdPointXid}).$promise.then(function(point) {
            checkPoint(point);
            assert.equal(point.name, 'temporary test point updated');
            assert.equal(point.deviceName, 'Dashboard Demo');
            assert.equal(point.dataSourceXid, 'DS_997094');
            assert.equal(point.dataSourceName, 'Dashboard Demo');
            return Point.get({xid: createdPointXid}).$promise;
        }, function(error) {
            throw new Error(error.status + ' - ' + error.statusText);
        }).then(function() {
            throw new Error('Retrieved point which should have been deleted');
        }, function(error) {
            if (error instanceof Error) return $q.reject(error);
            assert.equal(error.status, 404);
        });
    }));

    function checkPoint(point) {
        assert.instanceOf(point, Point);
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
        assert.property(point, 'setPermission');
        if (point.setPermission !== null) {
            assert.isString(point.setPermission);
        }
        if (point.chartColour !== null) {
            assert.isString(point.chartColour);
        }
        assert.isBoolean(point.purgeOverride);
        assert.isString(point.plotType);
        assert.isObject(point.purgePeriod);
        assert.isObject(point.pointLocator);
        assert.isString(point.deviceName);
        assert.property(point, 'readPermission');
        if (point.readPermission !== null) {
            assert.isString(point.readPermission);
        }
        assert.isNumber(point.pointFolderId);
        assert.isAtLeast(point.pointFolderId, 0);
        assert.property(point, 'integralUnit');
        assert.property(point, 'unit');
        assert.isString(point.name);
        assert.isString(point.xid);
    }
});
