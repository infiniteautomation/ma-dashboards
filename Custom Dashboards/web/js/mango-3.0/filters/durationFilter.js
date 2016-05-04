/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['moment-timezone'], function(moment) {
'use strict';

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
