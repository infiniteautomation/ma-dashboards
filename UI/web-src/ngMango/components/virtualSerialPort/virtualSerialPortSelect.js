/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Luis Güette
 */

import componentTemplate from './virtualSerialPortSelect.html';

/**
 * @ngdoc directive
 * @name ngMango.directive:maVirtualSerialPortSelect
 * @restrict E
 * @description Displays a select drop down of Virtual Serial Ports
 */

const $inject = Object.freeze(['$scope']);
class VirtualSerialPortController {
    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }
    
    constructor($scope) {
        this.$scope = $scope;
    }
    
    $onInit() {
    }
    
    $onChanges(changes) {
    }
    
    setViewValue() {
        this.ngModelCtrl.$setViewValue(this.selected);
    }
    
    render() {
        this.selected = this.ngModelCtrl.$viewValue;
    }

}

export default {
    template: componentTemplate,
    controller: VirtualSerialPortController,
    bindings: {
        selectMultiple: '<?',
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    transclude: {
        labelSlot: '?maLabel'
    },
    designerInfo: {
        translation: 'ui.app.virtualSerialPort.select',
        icon: 'list'
    }
};
