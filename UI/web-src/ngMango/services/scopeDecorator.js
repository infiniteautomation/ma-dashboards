/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
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