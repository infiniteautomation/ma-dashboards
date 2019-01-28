/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Luis Güette
 */

import componentTemplate from './eventHandlerProcessEditor.html';

const $inject = Object.freeze(['$scope']);

class eventHandlerProcessEditorController {

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
    controller: eventHandlerProcessEditorController,
    template: componentTemplate
};