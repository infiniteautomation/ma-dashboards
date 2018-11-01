/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Luis Güette
 */

import componentTemplate from './mailingListSelect.html';

/**
 * @ngdoc directive
 * @name ngMango.directive:maMailingListSelect
 * @restrict E
 * @description Displays a select drop down of Mailing Lists
 */

const $inject = Object.freeze(['$scope', 'maMailingList']);
class MailingListSelectController {
    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }
    
    constructor($scope, maMailingList) {
        this.$scope = $scope;
        this.maMailingList = maMailingList;
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
        this.getLists();
        this.newList();
    }
    
    $onChanges(changes) {
    }
    
    setViewValue() {
        this.ngModelCtrl.$setViewValue(this.selected);
    }
    
    render() {
        this.selected = this.ngModelCtrl.$viewValue;
    }

    getLists() {
        this.maMailingList.list().then(
            lists => {
                this.lists = lists;
            }
        );
    }

    newList() {
        this.new = true;
        this.selected = new this.maMailingList();
        this.setViewValue();
    }

}

export default {
    template: componentTemplate,
    controller: MailingListSelectController,
    bindings: {},
    require: {
        ngModelCtrl: 'ngModel'
    },
    transclude: {
        labelSlot: '?maLabel'
    },
    designerInfo: {
        translation: 'ui.app.mailingLists.select',
        icon: 'list'
    }
};
