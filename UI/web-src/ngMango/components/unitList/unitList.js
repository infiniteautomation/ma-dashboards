/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import unitListTemplate from './unitList.html';
import unitList from './unitList.json';
import './unitList.css';

class UnitListController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return []; }
    
    constructor() {
        this.mode = 'replace';
    }
    
    buttonClicked(event) {
        // if we do this in the constructor the component takes a noticeable amount of time to render
        this.unitList = unitList;
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
    }

    render() {
        this.unit = this.ngModelCtrl.$viewValue;
    }
    
    unitSelected(unit) {
        const current = (this.unit || '').trim();
        
        switch (this.mode) {
            case 'replace': {
                this.unit = unit;
                break;
            }
            case 'multiply': {
                this.unit = current ? `${current}\u00b7${unit}` : unit;
                break;
            }
            case 'divide': {
                this.unit = current ? `${current}/${unit}` : unit;
                break;
            }
        }
        
        this.ngModelCtrl.$setViewValue(this.unit);
    }
    
    clearUnit() {
        this.unit = '';
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
        disabled: '@?',
        mode: '@?'
    }
};
