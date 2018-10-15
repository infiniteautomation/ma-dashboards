/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Luis Güette
 */

import componentTemplate from './mailingList.html';

/**
 * @ngdoc directive
 * @name ngMango.directive:maMailingLists
 * @restrict E
 * @description Displays a Mailing Lists Component
 */

const $inject = Object.freeze(['$scope', '$mdMedia']);
class MailingLists {
    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }
    
    constructor($scope, $mdMedia) {
        this.$scope = $scope;
        this.$mdMedia = $mdMedia
    }
    
    $onInit() {}
}

export default {
    template: componentTemplate,
    controller: MailingLists,
    bindings: {},
    require: {}
};