/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Luis Güette
 */

import componentTemplate from './mailingListList.html';
import angular from 'angular';

/**
 * @ngdoc directive
 * @name ngMango.directive:maMailingListList
 * @restrict E
 * @description Displays a list of Mailing lists
 */

const $inject = Object.freeze(['$scope', 'maMailingList', 'maDialogHelper']);
class MailingListsListController {
    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }
    
    constructor($scope, maMailingList, maDialogHelper) {
        this.$scope = $scope;
        this.maMailingList = maMailingList;
        this.maDialogHelper = maDialogHelper;
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
        this.getLists();

        this.$scope.$on('mailingListUpdated', (event, arg) => {
            this.getScripts();
        });

        this.$scope.$on('newMailingList', (event, arg) => {
            this.new = true;
        });

    }
    
    $onChanges(changes) {
    }
    
    setViewValue() {
        this.ngModelCtrl.$setViewValue(this.selectedList);
    }
    
    render() {
        this.selectedList = this.ngModelCtrl.$viewValue;
    }
    
    newList() {
        this.new = true;
        this.selectedList = new this.maMailingList();
        this.setViewValue();
    }

    selectList(list) {
        this.new = false;
        this.selectedList = list;
        this.setViewValue();
    }

    getLists() {
        this.maMailingList.list().then(
            lists => {
                this.lists = lists;
                this.newList();
            }
        );
    }

}

export default {
    template: componentTemplate,
    controller: MailingListsListController,
    bindings: {},
    require: {
        ngModelCtrl: 'ngModel'
    },
    designerInfo: {
        translation: 'globalScript.list',
        icon: 'list'
    }
};
