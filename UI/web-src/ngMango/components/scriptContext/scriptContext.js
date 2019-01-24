/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Luis Güette
 */

import componentTemplate from './scriptContext.html';

const $inject = Object.freeze(['$scope']);

class scriptContextController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }

    constructor($scope) {
        this.$scope = $scope;
    }

    $onInit() {
        
    }

}

export default {
    bindings: {},
    require: {

    },
    controller: scriptContextController,
    template: componentTemplate
};