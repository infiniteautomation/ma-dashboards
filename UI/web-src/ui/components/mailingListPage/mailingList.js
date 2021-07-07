/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import componentTemplate from './mailingList.html';

import './mailingList.css';

/**
 * @ngdoc directive
 * @name ngMango.directive:maMailingLists
 * @restrict E
 * @description Displays a Mailing Lists Component
 */

const $inject = Object.freeze(['$scope', '$mdMedia', 'maMailingList']);
class MailingLists {
    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }
    
    constructor($scope, $mdMedia, maMailingList) {
        this.$scope = $scope;
        this.$mdMedia = $mdMedia;
        this.maMailingList = maMailingList;

        this.$scope.$on('mailingListUpdated', (event, arg) => {
            this.$scope.$broadcast('mailingListWasUpdated', true);
        });

        this.$scope.$on('newMailingList', (event, arg) => {
            this.$scope.$broadcast('addNewMailingList', true);
        });
    }
    
    $onInit() {}

    newList() {
        this.selectedList = new this.maMailingList();
    }
}

export default {
    template: componentTemplate,
    controller: MailingLists,
    bindings: {},
    require: {}
};