/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([], function() {
'use strict';
/**
 * @ngdoc filter
 * @name maFilters.trFilter
 *
 * @description
 *
 *
 */
/*
 * The translate filter cannot asynchronously load the translation namespace and display the translation.
 * Translation namespace must be loaded into Globalize prior to filter being run.
 */
function trFilter(Translate) {
    return function(key) {
        var args;
        if (angular.isArray(key)) {
            args = Array.prototype.slice.call(key, 1);
            key = key[0];
        } else {
            args = Array.prototype.slice.call(arguments, 1);
        }
    	var text;
    	try {
        	text = Translate.trSync(key, args);
    	} catch (e) {
    		text = '!!' + key + '!!';
    	}
    	return text;
    };
}

trFilter.$inject = ['Translate'];
return trFilter;

}); // define
