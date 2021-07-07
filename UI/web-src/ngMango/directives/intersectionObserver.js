/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

intersectionObserverDirective.$inject = ['$window'];
function intersectionObserverDirective($window) {
    const supported = 'IntersectionObserver' in $window;
    
    class IntersectionObserverController {
        static get $inject() { return ['$scope', '$element']; }
        static get $$ngIsClass() { return true; }
        
        constructor($scope, $element) {
            this.$scope = $scope;
            this.$element = $element;
            
            this.listeners = new Map();
        }
        
        $onInit() {
            if (supported) {
                this.createObserver();
            }
        }
        
        $onDestroy() {
            if (this.observer) {
                this.observer.disconnect();
            }
        }
        
        createObserver() {
            const root = this.observerRoot ? $window.document.querySelector(this.observerRoot) : this.$element[0];
            const threshold = Number.isFinite(this.observerThreshold) ? this.observerThreshold : 0;
            const rootMargin = this.observerMargin || '0px';
            
            this.observer = new $window.IntersectionObserver(this.listener.bind(this), {
                root,
                rootMargin,
                threshold
            });
        }
        
        listener(entries) {
            for (let entry of entries) {
                const listener = this.listeners.get(entry.target);
                if (listener) {
                    listener(entry);
                }
            }
        }
        
        observe(element, callback) {
            if (this.observer) {
                this.observer.observe(element);
            }
            this.listeners.set(element, callback);
        }
        
        unobserve(element) {
            if (this.observer) {
                this.observer.unobserve(element);
            }
            this.listeners.delete(element);
        }
    }
    
    return {
        restrict: 'A',
        scope: false,
        controller: IntersectionObserverController,
        bindToController: {
            observerRoot: '@?maIntersectionObserver',
            observerMargin: '@?',
            observerThreshold: '<?'
        }
    };
}

export default intersectionObserverDirective;
