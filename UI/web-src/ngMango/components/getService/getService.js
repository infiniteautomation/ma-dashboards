/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

class GetServiceController {
    static get $$ngIsClass() { return true; }
    static get $inject () {
        return ['$injector'];
    }
    
    constructor($injector) {
        this.$injector = $injector;
    }
    
    $onChanges(changes) {
        if (changes.serviceName && this.serviceName) {
            if (this.$injector.has(this.serviceName)) {
                this.service({
                    $service: this.$injector.get(this.serviceName)
                });
            }
        }
    }
}

export default {
    bindings: {
        serviceName: '@',
        service: '&'
    },
    controller: GetServiceController
};
