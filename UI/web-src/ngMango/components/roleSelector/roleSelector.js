/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import roleSelectorTemplate from './roleSelector.html';
import './roleSelector.css';

class RoleSelectorController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maRole', '$element']; }
    
    constructor(maRole, $element) {
        this.maRole = maRole;
        this.$element = $element;
        this.selected = new Set();
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
        this.filterRoles();
    }

    $onChanges(changes) {
        if (changes.disabledOptions) {
            this.disabledOptionsMap = {};
            if (Array.isArray(this.disabledOptions)) {
                this.disabledOptions.forEach(r => this.disabledOptionsMap[r] = true);
            }
        }
        if (changes.multiple) {
            if (this.multiple) {
                this.$element[0].setAttribute('multiple', 'multiple');
            } else {
                this.$element[0].removeAttribute('multiple');
            }
        }
    }

    render() {
        this.selected.clear();

        const roles = this.ngModelCtrl.$viewValue;
        if (this.multiple && Array.isArray(roles)) {
            roles.forEach(r => this.selected.add(r));
        } else if (!this.multiple && typeof roles === 'string') {
            this.selected.add(roles);
        }
    }
    
    setViewValue() {
        if (this.multiple) {
            this.ngModelCtrl.$setViewValue(Array.from(this.selected));
        } else {
            const [first] = this.selected.values();
            this.ngModelCtrl.$setViewValue(first);

            if (this.dropDownCtrl) {
                this.dropDownCtrl.close();
            }
        }
    }

    loadInherited(role, limit, offset = 0) {
        const queryBuilder = this.maRole.buildQuery()
            .eq('inheritedBy', role.xid)
            .sort('name');

        if (Number.isFinite(limit)) {
            queryBuilder.limit(limit, offset)
        }

        return queryBuilder.query();
    }

    filterRoles() {
        const builder = this.maRole.buildQuery();
        
        if (this.filter) {
            builder.match('name', `*${this.filter}*`);
        } else {
            builder.eq('inheritedBy', null);
        }
        
        this.rolesPromise = builder.sort('name')
            .query();
    }

    labelClicked(event, item) {
        event.stopPropagation();
        if (!this.disabled) {
            if (!this.multiple) {
                this.selected.clear();
            }

            if (this.selected.has(item.xid)) {
                this.selected.delete(item.xid);
            } else {
                this.selected.add(item.xid);
            }

            this.setViewValue();
        }
    }
}

export default {
    require: {
        ngModelCtrl: 'ngModel',
        dropDownCtrl: '?^^maDropDown'
    },
    bindings: {
        multiple: '<?ngMultiple',
        disabled: '<?ngDisabled',
        required: '<?ngRequired',
        disabledOptions: '<?'
    },
    controller: RoleSelectorController,
    template: roleSelectorTemplate
};
