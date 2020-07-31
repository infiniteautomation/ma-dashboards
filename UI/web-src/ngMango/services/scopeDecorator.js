/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

scopeDecorator.$inject = ['$delegate', 'maEventBus'];
function scopeDecorator($rootScope, maEventBus) {
    Object.assign($rootScope.constructor.prototype, {
        $maSubscribe(type, listener) {
            const removeListener = maEventBus.subscribe(type, listener);
            const deregister = this.$on('$destroy', removeListener);
            return () => {
                deregister();
                removeListener();
            };
        }
    });
    return $rootScope;
}

export default scopeDecorator;