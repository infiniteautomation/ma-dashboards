/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['moment-timezone'], function(moment) {
'use strict';
/**
 * @ngdoc filter
 * @name maFilters.duration
 *
 * @description
 * Converts an input in milliseconds to a momentJS <a href="http://momentjs.com/docs/#/durations/" target="_blank">duration</a> object that defines a length of time.
 * - MomentJS duration methods can be called using the filter syntax to call functions: 
 *      - <code ng-non-bindable>67223455ms is {{67223455|duration:'humanize'}}</code>
 * - <a ui-sref="dashboard.examples.basics.filters">View Filters Demo</a>
 */
function durationFilter(Util) {
    return Util.memoize(function(input, fnName) {
        var d = moment.duration(input);
        var fnArgs = Array.prototype.slice.call(arguments, 2);
        var fn = d[fnName];
        if (typeof fn !== 'function') return input;
        return fn.apply(d, fnArgs);
    });
}

durationFilter.$inject = ['Util'];
return durationFilter;

}); // define
