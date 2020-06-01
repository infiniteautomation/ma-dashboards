/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import permissionEditorTemplate from './permissionEditor.html';
import './permissionEditor.css';

class PermissionEditorController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return []; }
    
    constructor() {
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
    }
    
    render() {
        this.permission = this.ngModelCtrl.$viewValue;
    }
    
    permissionChanged() {
        this.ngModelCtrl.$setViewValue(this.permission.slice());
    }
}

export default {
    require: {
        ngModelCtrl: 'ngModel'
    },
    bindings: {
        description: '@'
    },
    controller: PermissionEditorController,
    template: permissionEditorTemplate
};
