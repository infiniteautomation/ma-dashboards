/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import permissionEditorTemplate from './permissionEditor.html';
import './permissionEditor.css';

class PermissionEditorController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maPermission', '$element']; }
    
    constructor(maPermission, $element) {
        this.maPermission = maPermission;
        $element.addClass( 'ma-permission-editor-row');
    }
    
    $onInit() {
        this.containerCtrl.register(this);
        this.ngModelCtrl.$render = () => this.render();
    }

    $onDestroy() {
        this.containerCtrl.deregister(this);
    }

    render() {
        const viewValue = Array.isArray(this.ngModelCtrl.$viewValue) ? this.ngModelCtrl.$viewValue : [];
        this.permission = new this.maPermission(viewValue);

        const minterms = this.containerCtrl.minterms;
        this.columns = minterms.map(minterm => {
            const hasSuperadmin = minterm.has('superadmin');
            const checked = hasSuperadmin || this.permission.has(minterm);
            return {
                minterm,
                checked,
                hasSuperadmin
            };
        });

        this.additionalMinterms = this.permission.minterms.filter(a => !minterms.some(b => a.equals(b)));
    }
    
    columnChanged(column) {
        if (column.checked) {
            this.permission.add(column.minterm);
        } else {
            this.permission.delete(column.minterm);
        }
        this.ngModelCtrl.$setViewValue(this.permission.toArray());
    }
}

export default {
    transclude: true,
    require: {
        ngModelCtrl: 'ngModel',
        containerCtrl: '^^maPermissionEditorContainer'
    },
    bindings: {
        description: '@'
    },
    controller: PermissionEditorController,
    template: permissionEditorTemplate
};
