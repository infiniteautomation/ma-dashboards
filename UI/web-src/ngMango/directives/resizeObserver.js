/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

/**
 * @ngdoc directive
 * @name ngMango.directive:maResizeObserver
 * @restrict E
 * @description
 */

import ResizeObserver from '@juggle/resize-observer';

resizeObserver.$inject = [];
function resizeObserver() {

    class ResizeObserverController {
        static get $$ngIsClass() { return true; }
        static get $inject() { return ['$element', '$scope']; }
        
        constructor($element, $scope) {
            this.$element = $element;
            this.$scope = $scope;

            let timeout;
            this.resizeObserver = new ResizeObserver(entries => {
                const entry = entries[entries.length - 1];

                if (Number.isFinite(this.debounceTimeout) && this.debounceTimeout > 0) {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => {
                        this.triggerCallback(entry);
                    }, this.debounceTimeout);
                } else {
                    this.triggerCallback(entry);
                }
            });
        }

        $onInit() {
            this.resizeObserver.observe(this.$element[0]);
        }
        
        $destroy() {
            this.resizeObserver.disconnect();
        }
        
        triggerCallback(entry) {
            this.$scope.$applyAsync(() => {
                this.onResize({$entry: entry});
            });
        }
    }
    
    return {
        scope: false,
        restrict: 'A',
        controller: ResizeObserverController,
        bindToController: {
            onResize: '&',
            debounceTimeout: '<?'
        }
    };
}

export default resizeObserver;