/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

ResizeObserverFactory.$inject = ['$rootScope'];
function ResizeObserverFactory($rootScope) {

    class MangoResizeObserver {
        constructor(element, resizeCallback, $scope = $rootScope, debounce = 500) {
            this.element = element;
            this.resizeCallback = resizeCallback;
            this.$scope = $scope;
            this.debounce = debounce;
        }

        observe() {
            // already setup
            if (this.resizeObserver || this.resizeInterval) return;

            /* globals ResizeObserver */
            if (typeof ResizeObserver === 'function') {
                this.resizeObserver = new ResizeObserver(entries => {
                    const rect = entries[0].contentRect;
                    this.triggerCallback(rect);
                });
                this.resizeObserver.observe(this.element);
            } else {
                this.resizeInterval = setInterval(() => {
                    const rect = this.element.getBoundingClientRect();
                    if (rect.width !== this.width || rect.height !== this.height) {
                        this.triggerCallback(rect);
                    }
                    this.width = rect.width;
                    this.height = rect.height;
                }, this.debounce);
            }
        }
        
        triggerCallback(rect) {
            if (this.pendingResize) {
                clearTimeout(this.pendingResize);
            }
            this.pendingResize = setTimeout(() => {
                delete this.pendingResize;
                this.$scope.$applyAsync(() => {
                    this.resizeCallback(rect);
                });
            }, this.debounce);
        }

        disconnect() {
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