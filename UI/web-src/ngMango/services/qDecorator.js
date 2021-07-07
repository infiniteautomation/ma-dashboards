/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

qDecorator.$inject = ['$delegate'];
function qDecorator($delegate) {

    const originalThen = $delegate.prototype.then;
    $delegate.prototype.then = function() {
        const newPromise = originalThen.apply(this, arguments);
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
            try {
                this.doCancel.apply(this, arguments);
            } catch (e) {}
        }
        return this;
    };

    const all = $delegate.all;
    const race = $delegate.race;

    $delegate.all = function(promises) {
        const p = all.apply(this, arguments);
        const doCancel = getCancelAll(promises);
        return p.setCancel(doCancel);
    };
    
    $delegate.race = function(promises) {
        const p = race.apply(this, arguments);
        const doCancel = getCancelAll(promises);
        return p.setCancel(doCancel);
    };
    
    function getCancelAll(promises) {
        return function() {
            const cancelArgs = arguments;
            promises.forEach(function(promise) {
                promise.cancel.apply(promise, cancelArgs);
            });
        };
    }

    return $delegate;
}

export default qDecorator;


