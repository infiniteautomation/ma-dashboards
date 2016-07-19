/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['moment-timezone'], function(moment) {
'use strict';
/**
 * @ngdoc filter
 * @name maFilters.momentFilter
 *
 * @description
 *
 *
 */
function momentFilter(Util) {
    return Util.memoize(function(input, fnName) {
        var m;
        if (!input || (typeof input === 'string' && input.toLowerCase().trim() === 'now')) {
            m = moment().milliseconds(0);
        } else {
            m = moment(input);
        }
        if (!m.isValid()) {
            return input;
        }
        var fnArgs = Array.prototype.slice.call(arguments, 2);
        var fn = m[fnName];
        if (typeof fn !== 'function') return input;
        return fn.apply(m, fnArgs);
    });
}

momentFilter.$inject = ['Util'];
return momentFilter;

}); // define
