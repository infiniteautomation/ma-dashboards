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
	Util.prototype.arrayDiff = function (newArray, oldArray) {
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
    Util.prototype.toMoment = function(input, now, format) {
        if (!input || input === 'now') return moment(now);
        if (typeof input === 'string') {
        	return moment(input, format || mangoDefaultDateFormat);
        }
        return moment(input);
    };

    /**
     * test for null, undefined or whitespace
     */ 
    Util.prototype.isEmpty = function(str) {
    	return !str || /^\s*$/.test(str);
    };

    /**
     * @return Number of keys in object starting with xxx
     */
    Util.prototype.numKeys = function(obj, start) {
    	var count = 0;
    	for (var key in obj) {
    		if (key.indexOf(start) === 0) count++;
    	}
    	return count;
    };
    
    
    Util.prototype.cancelAll = function(cancelFns) {
    	// remove all elements from cancelFns array so cancel fns are never called again
    	cancelFns = cancelFns.splice(0, cancelFns.length);
    	for (var i = 0; i < cancelFns.length; i++)
    		cancelFns[i]();
    };
    
    Util.prototype.openSocket = function(path) {
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
    
    /**
     * Parses an array response from a Mango endpoint which contains a total
     * and assigns it as the property $total on the array
     */
    Util.prototype.transformArrayResponse = function(data, fn, code) {
        var parsed = angular.fromJson(data);
        if (code < 300) {
            parsed.items.$total = parsed.total || parsed.items.length;
            return parsed.items;
        }
        return parsed;
    };
    
    /**
     *  Copies the total from the transformed array onto the actual destination
     *  array and computes page number
     */
    Util.prototype.arrayResponseInterceptor = function(data) {
        var start = 0;
        var limit = data.resource.length;
        var total = data.data.$total;

        var matches = /(?:&|\?)limit\((\d+)(?:,(\d+))?\)/i.exec(data.config.url);
        if (matches) {
            limit = parseInt(matches[1], 10);
            if (matches[2]) {
                start = parseInt(matches[2], 10);
            }
        }
        
        data.resource.$start = start;
        data.resource.$limit = limit;
        data.resource.$total = total;
        data.resource.$pages = Math.ceil(total / limit);
        data.resource.$page = Math.floor(start / limit) + 1;
        
        return data.resource;
    };
    
    /**
     * Extremely simple memoize function that works on === equality
     * Used to prevent infinite digest loops in filters etc
     */
    Util.prototype.memoize = function(fn, cacheSize) {
        var cache = [];
        cacheSize = cacheSize || 10;
        do {
            cache.push(undefined);
        } while (--cacheSize > 0);
        
        return function() {
            var args = Array.prototype.slice.call(arguments, 0);

            searchCache: for (var i = 0; i < cache.length; i++) {
                var cacheItem = cache[i];
                if (!cacheItem) break;
                
                var cachedArgs = cacheItem.input;
                if (cachedArgs.length !== args.length) continue;
                
                for (var j = 0; j < cachedArgs.length; j++) {
                    if (cachedArgs[j] !== args[j]) continue searchCache;
                }

                return cacheItem.output;
            }

            var result = fn.apply(null, args);

            cache.unshift({input: args, output: result});
            cache.pop();
            
            return result;
        };
    };
    
    return new Util();
}

UtilFactory.$inject = ['mangoBaseUrl', 'mangoDefaultDateFormat'];
return UtilFactory;

}); // define
