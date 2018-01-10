/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';

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

return {
    bindings: {
        serviceName: '@',
        service: '&'
    },
    controller: GetServiceController
};

}); // define
