/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import unitListTemplate from './unitList.html';
import unitList from './unitList.json';
import './unitList.css';

class UnitListController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return []; }
    
    constructor() {
        this.unitList = unitList;
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
    }

    render() {
        this.unit = this.ngModelCtrl.$viewValue;
    }
    
    setViewValue() {
        this.ngModelCtrl.$setViewValue(this.unit);
    }
}

export default {
    controller: UnitListController,
    template: unitListTemplate,
    require: {
        'ngModelCtrl': 'ngModel'
    },
    bindings: {
        disabled: '@?'
    }
};
