/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'moment-timezone'], function(angular, moment) {
'use strict';

function UtilFactory(mangoBaseUrl, mangoDefaultDateFormat) {
	function Util() {}
	
	/**
	 * @return difference object
	 */
	Util.arrayDiff = function (newArray, oldArray) {
    	if (newArray === undefined) newArray = [];
    	if (oldArray === undefined) oldArray = [];
    	
    	var added = angular.element(newArray).not(oldArray);
    	var removed = angular.element(oldArray).not(newArray);

    	return {
    		added: added,
    		removed: removed,
    		changed: !!(added.length || removed.length)
    	};
    };
    
    /**
     * Converts input to a moment
     */
    Util.toMoment = function(input, now, format) {
        if (!input || input === 'now') return moment(now);
        if (typeof input === 'string') {
        	return moment(input, format || mangoDefaultDateFormat);
        }
        return moment(input);
    };

    /**
     * test for null, undefined or whitespace
     */ 
    Util.isEmpty = function(str) {
    	return !str || /^\s*$/.test(str);
    };

    /**
     * @return Number of keys in object starting with xxx
     */
    Util.numKeys = function(obj, start) {
    	var count = 0;
    	for (var key in obj) {
    		if (key.indexOf(start) === 0) count++;
    	}
    	return count;
    };
    
    
    Util.cancelAll = function(cancelFns) {
    	// remove all elements from cancelFns array so cancel fns are never called again
    	cancelFns = cancelFns.splice(0, cancelFns.length);
    	for (var i = 0; i < cancelFns.length; i++)
    		cancelFns[i]();
    };
    
    Util.openSocket = function(path) {
        if (!('WebSocket' in window)) {
            throw new Error('WebSocket not supported');
        }
        
        var host = document.location.host;
        var protocol = document.location.protocol;
        
        if (mangoBaseUrl) {
            var i = mangoBaseUrl.indexOf('//');
            if (i >= 0) {
                protocol = mangoBaseUrl.substring(0, i);
                host = mangoBaseUrl.substring(i+2);
            }
            else {
                host = mangoBaseUrl;
            }
        }
        
        protocol = protocol === 'https:' ? 'wss:' : 'ws:';
        
        return new WebSocket(protocol + '//' + host + path);
    };
    
    return Util;
}

UtilFactory.$inject = ['mangoBaseUrl', 'mangoDefaultDateFormat'];
return UtilFactory;

}); // define
