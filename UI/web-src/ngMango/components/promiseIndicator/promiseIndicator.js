/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import promiseIndicatorTemplate from './promiseIndicator.html';
import './promiseIndicator.css';

const Status = Object.freeze({
    PENDING: {className: 'ma-promise-pending'},
    RESOLVED: {className: 'ma-promise-resolved'},
    ERROR: {className: 'ma-promise-error'}
});

class PromiseIndicatorController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$element', '$scope', '$timeout']; }
    
    constructor($element, $scope, $timeout) {
        this.$element = $element;
        this.$timeout = $timeout;
        this.resetDelay = 5000;
        $scope.Status = Status;
    }
    
    $onChanges(changes) {
        if (changes.promise) {
            this.promiseChanged(this.promise);
        }
    }
    
    promiseChanged(promise) {
        if (this.resetPromise) {
            this.$timeout.cancel(this.resetPromise);
            delete this.resetPromise;
        }
        
        delete this.result;
        delete this.error;
        this.status = promise ? Status.PENDING : null;
        this.updateClasses();
        
        if (!promise) {
            return;
        }
        
        promise.then(result => {
            if (promise === this.promise) {
                this.status = Status.RESOLVED;
                this.result = result;
            }
        }, error => {
            if (promise === this.promise) {
                this.status = Status.ERROR;
                this.error = error;
            }
        }).finally(() => {
            if (promise === this.promise) {
                this.updateClasses();
                if (this.resetDelay) {
                    this.resetPromise = this.$timeout(() => this.reset(), this.resetDelay);
                }
            }
        });
    }
    
    reset() {
        delete this.result;
        delete this.error;
        this.status = null;
        this.updateClasses();
    }
    
    updateClasses() {
        Object.values(Status).forEach(s => this.$element.removeClass(s.className));
        if (this.status) {
            this.$element.addClass(this.status.className);
        }
    }
}

export default {
    bindings: {
        promise: '<',
        resetDelay: '<?'
    },
    controller: PromiseIndicatorController,
    template: promiseIndicatorTemplate
};
