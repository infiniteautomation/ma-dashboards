/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

ResizeObserverFactory.$inject = ['$rootScope'];
function ResizeObserverFactory($rootScope) {

    class MangoResizeObserver {
        constructor(element, resizeCallback, $scope = $rootScope, debounce = 500, interval = 500) {
            this.element = element;
            this.resizeCallback = resizeCallback;
            this.$scope = $scope;
            this.debounce = debounce;
            this.interval = interval;
        }

        observe(immediateCallback = true) {
            // already setup
            if (this.resizeObserver || this.resizeInterval) return;
            
            const rect = this.element.getBoundingClientRect();
            this.width = rect.width;
            this.height = rect.height;
            if (immediateCallback) {
                this.resizeCallback(rect);
            }

            /* globals ResizeObserver */
            if (typeof ResizeObserver === 'function') {
                this.resizeObserver = new ResizeObserver(entries => {
                    this.debounceCheck();
                });
                this.resizeObserver.observe(this.element);
            } else {
                this.resizeInterval = setInterval(() => {
                    this.doCheck();
                }, this.interval);
            }
        }
        
        debounceCheck() {
            if (this.pendingResize) {
                clearTimeout(this.pendingResize);
            }
            this.pendingResize = setTimeout(() => {
                delete this.pendingResize;
                this.doCheck();
            }, this.debounce);
        }

        doCheck() {
            const rect = this.element.getBoundingClientRect();
            if (rect.width !== this.width || rect.height !== this.height) {
                this.$scope.$applyAsync(() => {
                    this.resizeCallback(rect);
                });
            }
            this.width = rect.width;
            this.height = rect.height;
        }

        disconnect() {
            if (this.pendingResize) {
                clearTimeout(this.pendingResize);
                delete this.pendingResize;
            }
            if (this.resizeObserver) {
                this.resizeObserver.disconnect();
                delete this.resizeObserver;
            }
            if (this.resizeInterval) {
                clearInterval(this.resizeInterval);
                delete this.resizeInterval;
            }
        }
    }

    return MangoResizeObserver;
}

export default ResizeObserverFactory;