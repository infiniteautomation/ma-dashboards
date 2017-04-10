/**
 * Copyright (C) 2015 Infinite Automation Systems, Inc. All rights reserved.
 * http://infiniteautomation.com/
 * @author Jared Wiltshire
 * 
 * Mocha test spec, run "npm test" from the root directory to run test
 */

describe('Util service', function() {
    'use strict';

    var MochaUtils = require('../../../../web-test/mocha');
    var mochaUtils = new MochaUtils();
    var Util;
    
    before('Load maServices module', function(done) {
        this.timeout(5000);
        
        requirejs(['mango-3.4/maServices'], function(maServices) {
            done();
        });
        
        mochaUtils.initEnvironment();
    });
    
    after(function() {
        mochaUtils.cleanupEnvironment();
    });

    beforeEach(function() {
        var injector = angular.injector(['ng', 'ngMock', 'maServices'], true);
        mochaUtils.setInjector(injector);
        Util = injector.get('Util');
    });

    afterEach(function() {
        mochaUtils.cleanupInjector();
    });

    describe('parseInternationalFloat()', function() {
        it('parses numbers with no thousands separators and full stop radix point', function() {
            assert.equal(Util.parseInternationalFloat('1234567'), 1234567);
            assert.equal(Util.parseInternationalFloat('11234567'), 11234567);
            assert.equal(Util.parseInternationalFloat('111234567'), 111234567);
            assert.equal(Util.parseInternationalFloat('234567'), 234567);
            assert.equal(Util.parseInternationalFloat('1234'), 1234);
            assert.equal(Util.parseInternationalFloat('123'), 123);
            assert.equal(Util.parseInternationalFloat('1234567.89'), 1234567.89);
            assert.equal(Util.parseInternationalFloat('11234567.89'), 11234567.89);
            assert.equal(Util.parseInternationalFloat('111234567.89'), 111234567.89);
            assert.equal(Util.parseInternationalFloat('1234567.891'), 1234567.891);
            assert.equal(Util.parseInternationalFloat('1234567.890'), 1234567.89);
            assert.equal(Util.parseInternationalFloat('123.891'), 123.891);
            assert.equal(Util.parseInternationalFloat('1234567.8'), 1234567.8);
            assert.equal(Util.parseInternationalFloat('1234567.0'), 1234567);
            assert.equal(Util.parseInternationalFloat('234567.89'), 234567.89);
            assert.equal(Util.parseInternationalFloat('1234.894'), 1234.894);
            assert.equal(Util.parseInternationalFloat('1234.89'), 1234.89);
            assert.equal(Util.parseInternationalFloat('123.89'), 123.89);
            assert.equal(Util.parseInternationalFloat('123.894'), 123.894);
            assert.equal(Util.parseInternationalFloat('12.89'), 12.89);
            assert.equal(Util.parseInternationalFloat('1.89'), 1.89);
        });
        
        it('parses numbers with comma thousands separators and full stop radix point (USA, UK etc)', function() {
            assert.equal(Util.parseInternationalFloat('1,234,567'), 1234567);
            assert.equal(Util.parseInternationalFloat('11,234,567'), 11234567);
            assert.equal(Util.parseInternationalFloat('111,234,567'), 111234567);
            assert.equal(Util.parseInternationalFloat('234,567'), 234567);
            assert.equal(Util.parseInternationalFloat('1,234'), 1234);
            assert.equal(Util.parseInternationalFloat('1,234,567.89'), 1234567.89);
            assert.equal(Util.parseInternationalFloat('11,234,567.89'), 11234567.89);
            assert.equal(Util.parseInternationalFloat('111,234,567.89'), 111234567.89);
            assert.equal(Util.parseInternationalFloat('1,234,567.891'), 1234567.891);
            assert.equal(Util.parseInternationalFloat('1,234,567.890'), 1234567.89);
            assert.equal(Util.parseInternationalFloat('1,234,567.8'), 1234567.8);
            assert.equal(Util.parseInternationalFloat('1,234,567.0'), 1234567);
            assert.equal(Util.parseInternationalFloat('234,567.89'), 234567.89);
            assert.equal(Util.parseInternationalFloat('1,234.89'), 1234.89);
        });
        
        it('parses numbers with space thousands separators and full stop radix point (English SI style)', function() {
            assert.equal(Util.parseInternationalFloat('1 234 567'), 1234567);
            assert.equal(Util.parseInternationalFloat('11 234 567'), 11234567);
            assert.equal(Util.parseInternationalFloat('111 234 567'), 111234567);
            assert.equal(Util.parseInternationalFloat('234 567'), 234567);
            assert.equal(Util.parseInternationalFloat('1 234'), 1234);
            assert.equal(Util.parseInternationalFloat('1 234 567.89'), 1234567.89);
            assert.equal(Util.parseInternationalFloat('11 234 567.89'), 11234567.89);
            assert.equal(Util.parseInternationalFloat('111 234 567.89'), 111234567.89);
            assert.equal(Util.parseInternationalFloat('1 234 567.891'), 1234567.891);
            assert.equal(Util.parseInternationalFloat('1 234 567.890'), 1234567.89);
            assert.equal(Util.parseInternationalFloat('1 234 567.8'), 1234567.8);
            assert.equal(Util.parseInternationalFloat('1 234 567.0'), 1234567);
            assert.equal(Util.parseInternationalFloat('234 567.89'), 234567.89);
            assert.equal(Util.parseInternationalFloat('1 234.89'), 1234.89);
        });
        
        it('parses numbers with single quote thousands separators and full stop radix point (Switzerland)', function() {
            assert.equal(Util.parseInternationalFloat('1\'234\'567'), 1234567);
            assert.equal(Util.parseInternationalFloat('11\'234\'567'), 11234567);
            assert.equal(Util.parseInternationalFloat('111\'234\'567'), 111234567);
            assert.equal(Util.parseInternationalFloat('234\'567'), 234567);
            assert.equal(Util.parseInternationalFloat('1\'234'), 1234);
            assert.equal(Util.parseInternationalFloat('1\'234\'567.89'), 1234567.89);
            assert.equal(Util.parseInternationalFloat('11\'234\'567.89'), 11234567.89);
            assert.equal(Util.parseInternationalFloat('111\'234\'567.89'), 111234567.89);
            assert.equal(Util.parseInternationalFloat('1\'234\'567.891'), 1234567.891);
            assert.equal(Util.parseInternationalFloat('1\'234\'567.890'), 1234567.89);
            assert.equal(Util.parseInternationalFloat('1\'234\'567.8'), 1234567.8);
            assert.equal(Util.parseInternationalFloat('1\'234\'567.0'), 1234567);
            assert.equal(Util.parseInternationalFloat('234\'567.89'), 234567.89);
            assert.equal(Util.parseInternationalFloat('1\'234.89'), 1234.89);
        });
        
        it('parses numbers with full stop thousands separators and comma radix point (Europe and South America)', function() {
            assert.equal(Util.parseInternationalFloat('1.234.567'), 1234567);
            assert.equal(Util.parseInternationalFloat('11.234.567'), 11234567);
            assert.equal(Util.parseInternationalFloat('111.234.567'), 111234567);
            assert.equal(Util.parseInternationalFloat('1.234.567,89'), 1234567.89);
            assert.equal(Util.parseInternationalFloat('11.234.567,89'), 11234567.89);
            assert.equal(Util.parseInternationalFloat('111.234.567,89'), 111234567.89);
            assert.equal(Util.parseInternationalFloat('1.234.567,891'), 1234567.891);
            assert.equal(Util.parseInternationalFloat('1.234.567,890'), 1234567.89);
            assert.equal(Util.parseInternationalFloat('1.234.567,8'), 1234567.8);
            assert.equal(Util.parseInternationalFloat('1.234.567,0'), 1234567);
            assert.equal(Util.parseInternationalFloat('234.567,89'), 234567.89);
            assert.equal(Util.parseInternationalFloat('1.234,89'), 1234.89);
        });
        
        it('parses numbers with space thousands separators and comma radix point (French SI style)', function() {
            assert.equal(Util.parseInternationalFloat('1 234 567'), 1234567);
            assert.equal(Util.parseInternationalFloat('11 234 567'), 11234567);
            assert.equal(Util.parseInternationalFloat('111 234 567'), 111234567);
            assert.equal(Util.parseInternationalFloat('1 234 567,89'), 1234567.89);
            assert.equal(Util.parseInternationalFloat('11 234 567,89'), 11234567.89);
            assert.equal(Util.parseInternationalFloat('111 234 567,89'), 111234567.89);
            assert.equal(Util.parseInternationalFloat('1 234 567,891'), 1234567.891);
            assert.equal(Util.parseInternationalFloat('1 234 567,890'), 1234567.89);
            assert.equal(Util.parseInternationalFloat('1 234 567,8'), 1234567.8);
            assert.equal(Util.parseInternationalFloat('1 234 567,0'), 1234567);
            assert.equal(Util.parseInternationalFloat('234 567,89'), 234567.89);
            assert.equal(Util.parseInternationalFloat('1 234,89'), 1234.89);
        });
        
        it('parses numbers with odd number grouping (China, India, Pakistan)', function() {
            assert.equal(Util.parseInternationalFloat('12,34,567.89'), 1234567.89);
            assert.equal(Util.parseInternationalFloat('123,4567.89'), 1234567.89);
        });
    });
});
