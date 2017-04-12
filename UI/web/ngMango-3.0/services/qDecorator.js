/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';

qDecorator.$inject = ['$delegate'];
function qDecorator($delegate) {
    function decoratePromise(promise) {
        var then = promise.then;
        promise.then = function() {
            var nextPromise = then.apply(this, arguments);
            if (typeof promise.cancel === 'function') {
                nextPromise.cancel = promise.cancel;
            }
            return decoratePromise(nextPromise);
        };
        
        promise.setCancel = function setCancel(cancel) {
            if (typeof cancel === 'function') {
                this.cancel = cancel;
            }
            return this;
        };
        
        return promise;
    }

    var defer = $delegate.defer;
    var when = $delegate.when;
    var reject = $delegate.reject;
    var all = $delegate.all;
    var race = $delegate.race;
    
    $delegate.defer = function() {
        var deferred = defer.apply(this, arguments);
        decoratePromise(deferred.promise);
        return deferred;
    };
    $delegate.when = function() {
        var p = when.apply(this, arguments);
        return decoratePromise(p);
    };
    $delegate.reject = function() {
        var p = reject.apply(this, arguments);
        return decoratePromise(p);
    };
    $delegate.all = function(promises) {
        var p = all.apply(this, arguments);
        p.cancel = getCancelAll(promises);
        return decoratePromise(p);
    };
    $delegate.race = function(promises) {
        var p = race.apply(this, arguments);
        p.cancel = getCancelAll(promises);
        return decoratePromise(p);
    };
    
    function getCancelAll(promises) {
        return function() {
            var cancelArgs = arguments;
            angular.forEach(promises, function(promise) {
                if (typeof promise.cancel === 'function') {
                    promise.cancel.apply(promise, cancelArgs);
                }
            });
        };
    }

    return $delegate;
}

return qDecorator;

});
