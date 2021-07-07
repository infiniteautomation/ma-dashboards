/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
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
    static get $inject() { return ['$element', '$scope', '$timeout', '$transclude']; }
    
    constructor($element, $scope, $timeout, $transclude) {
        this.$element = $element;
        this.$scope = $scope;
        this.$timeout = $timeout;
        this.$transclude = $transclude;
        
        this.resetDelay = 5000;
        $scope.Status = Status;
    }
    
    $onChanges(changes) {
        if (changes.promise) {
            this.promiseChanged(this.promise);
        }
    }
    
    $onInit() {
        this.$transclude((tClone, tScope) => {
            tScope.$indicator = this;
            tScope.Status = Status;
            
            this.hasTranscludeContent = Array.from(tClone).some(node => node.nodeType !== 3 || !!node.nodeValue.trim());
            if (this.hasTranscludeContent) {
                this.$element.append(tClone);
            }
        });
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
    transclude: true,
    controller: PromiseIndicatorController,
    template: promiseIndicatorTemplate
};
