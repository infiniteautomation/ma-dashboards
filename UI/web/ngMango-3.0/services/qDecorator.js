/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';

qDecorator.$inject = ['$delegate'];
function qDecorator($delegate) {

    var originalThen = $delegate.prototype.then;
    $delegate.prototype.then = function() {
        var newPromise = originalThen.apply(this, arguments);
        if (typeof this.doCancel === 'function') {
            newPromise.doCancel = this.doCancel;
        }
        return newPromise;
    };
    
    $delegate.prototype.setCancel = function(doCancel) {
        if (typeof doCancel === 'function') {
            this.doCancel = doCancel;
        }
        return this;
    };
    
    $delegate.prototype.cancel = function() {
        if (typeof this.doCancel === 'function') {
            this.doCancel.apply(this, arguments);
        }
        return this;
    };

    var all = $delegate.all;
    var race = $delegate.race;

    $delegate.all = function(promises) {
        var p = all.apply(this, arguments);
        var doCancel = getCancelAll(promises);
        return p.setCancel(doCancel);
    };
    
    $delegate.race = function(promises) {
        var p = race.apply(this, arguments);
        var doCancel = getCancelAll(promises);
        return p.setCancel(doCancel);
    };
    
    function getCancelAll(promises) {
        return function() {
            var cancelArgs = arguments;
            promises.forEach(function(promise) {
                promise.cancel.apply(promise, cancelArgs);
            });
        };
    }

    return $delegate;
}

return qDecorator;

});
