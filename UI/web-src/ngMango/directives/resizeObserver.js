/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

/**
 * @ngdoc directive
 * @name ngMango.directive:maResizeObserver
 * @restrict E
 * @description
 */

resizeObserver.$inject = ['maResizeObserver'];
function resizeObserver(MangoResizeObserver) {

    class ResizeObserverController {
        static get $$ngIsClass() { return true; }
        static get $inject() { return ['$element', '$scope']; }
        
        constructor($element, $scope) {
            this.resizeObserver = new MangoResizeObserver($element[0], rect => {
                this.onResize({$rect: rect});
            }, $scope);
        }

        $onInit() {
            this.resizeObserver.observe();
        }
        
        $destroy() {
            this.resizeObserver.disconnect();
        }
    }
    
    return {
        scope: false,
        restrict: 'A',
        controller: ResizeObserverController,
        bindToController: {
            onResize: '&'
        }
    };
}

export default resizeObserver;