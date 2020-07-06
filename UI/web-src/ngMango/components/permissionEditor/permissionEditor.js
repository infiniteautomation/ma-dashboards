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
        this.containerCtrl.register(this);
        this.ngModelCtrl.$render = () => this.render();
    }

    $onDestroy() {
        this.containerCtrl.deregister(this);
    }

    render() {
        this.permission = [];
        if (Array.isArray(this.ngModelCtrl.$viewValue)) {
            this.ngModelCtrl.$viewValue.forEach(minterm => {
                // canonicalize the minterms
                if (typeof minterm === 'string') {
                    this.permission.push([minterm]);
                } else if (Array.isArray(minterm)) {
                    this.permission.push(minterm.slice());
                }
            });
        }

        const minterms = this.containerCtrl.minterms;
        this.columns = minterms.map(minterm => {
            const includesSuperadmin = minterm.includes('superadmin');
            const checked = includesSuperadmin || this.permission.some(a => this.containerCtrl.mintermsEqual(a, minterm));
            return {
                minterm,
                checked,
                includesSuperadmin,
                id: minterm.join('&')
            };
        });

        this.additionalMinterms = this.permission.filter(a => !minterms.some(b => this.containerCtrl.mintermsEqual(a, b))).map(minterm => {
            return {
                minterm,
                id: minterm.join('&'),
                label: minterm.join(' & ')
            };
        });
    }
    
    columnChanged(column) {
        const i = this.permission.findIndex(mt => {
            return this.containerCtrl.mintermsEqual(mt, column.minterm);
        });

        if (column.checked && i < 0) {
            this.permission.push(column.minterm.slice());
        } else if (!column.checked  && i >= 0) {
            this.permission.splice(i, 1);
        }

        this.ngModelCtrl.$setViewValue(this.permission.slice());
    }
}

export default {
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
