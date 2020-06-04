/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import roleSelectorTemplate from './roleSelector.html';
import './roleSelector.css';

class RoleSelectorController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maRole']; }
    
    constructor(maRole) {
        this.maRole = maRole;
        
        this.selected = new Set();
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
        this.rolesPromise = this.maRole.buildQuery()
            .eq('inheritedBy', null)
            .sort('name')
            .query();
    }

    render() {
        const roles = this.ngModelCtrl.$viewValue;
        if (Array.isArray(roles)) {
            this.selected = new Set(roles);
        }
    }
    
    setViewValue() {
        this.ngModelCtrl.$setViewValue(Array.from(this.selected));
    }

    loadInherited(role) {
        return this.maRole.buildQuery()
            .eq('inheritedBy', role.xid)
            .sort('name')
            .query();
    }
    
    createModel(xid) {
        return Object.defineProperty({}, 'value', {
            get: () => this.selected.has(xid),
            set: value => {
                if (value) {
                    this.selected.add(xid);
                } else {
                    this.selected.delete(xid);
                }
                this.setViewValue();
            }
        });
    }
}

export default {
    require: {
        ngModelCtrl: 'ngModel'
    },
    controller: RoleSelectorController,
    template: roleSelectorTemplate
};
