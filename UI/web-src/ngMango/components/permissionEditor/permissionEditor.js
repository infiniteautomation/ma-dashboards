/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import permissionEditorTemplate from './permissionEditor.html';
import './permissionEditor.css';

const mintermsEqual = function(a, b) {
    return a.length === b.length && a.every(r => b.includes(r));
};

const mintermId = function(minterm) {
    return minterm.sort().join('&');
};

const mintermLabel = function(minterm) {
    return minterm.sort().join(' & ');
};

class PermissionEditorController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return []; }
    
    constructor() {
        this.minterms = [['superadmin'], ['user']];
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
    }

    $onChanges(changes) {
        if (changes.minterms && !changes.minterms.isFirstChange()) {
            this.render();
        }
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

        const minterms = Array.isArray(this.minterms) ? this.minterms : [];
        this.columns = minterms.map(minterm => {
            const includesSuperadmin = minterm.includes('superadmin');
            const checked = includesSuperadmin || this.permission.some(a => mintermsEqual(a, minterm));
            return {
                minterm,
                checked,
                includesSuperadmin,
                id: mintermId(minterm)
            };
        });

        this.additionalMinterms = this.permission.filter(a => !minterms.some(b => mintermsEqual(a, b))).map(minterm => {
            return {
                minterm,
                id: mintermId(minterm),
                label: mintermLabel(minterm)
            };
        });
    }
    
    columnChanged(column) {
        const i = this.permission.findIndex(mt => {
            return mintermsEqual(mt, column.minterm);
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
        ngModelCtrl: 'ngModel'
    },
    bindings: {
        description: '@',
        minterms: '<?',
        addColumn: '&'
    },
    controller: PermissionEditorController,
    template: permissionEditorTemplate
};
