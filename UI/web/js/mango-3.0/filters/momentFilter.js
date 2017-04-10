/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['moment-timezone'], function(moment) {
'use strict';

// Be careful that last filter in an expression doesn't return a date or a moment.
// It will cause an infinite digest loop due to angular checking for equality
// with === operator instead of deep object comparison.

function momentFilter() {
    return function(input, fnName) {
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
    };
}

momentFilter.$inject = [];
return momentFilter;

}); // define
