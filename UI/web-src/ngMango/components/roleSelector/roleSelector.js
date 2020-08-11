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
        this.selected = new Map();
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
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
            roles.forEach(r => this.selected.set(r.xid, r));
        } else if (!this.multiple && roles) {
            const role = roles;
            this.selected.set(role.xid, role);
        }
    }
    
    setViewValue() {
        if (this.multiple) {
            this.ngModelCtrl.$setViewValue(Array.from(this.selected.values()));
        } else {
            const [first] = this.selected.values();
            this.ngModelCtrl.$setViewValue(first);

            if (this.dropDownCtrl) {
                this.dropDownCtrl.close();
            }
        }
    }

    loadRoles(isRoot, role, limit, offset = 0) {
        const builder = this.maRole.buildQuery();

        if (isRoot) {
            if (this.filter) {
                builder.match('name', `*${this.filter}*`);
            } else {
                builder.eq('inheritedBy', null);
            }
        } else {
            builder.eq('inheritedBy', role.xid);
        }

        builder.sort('name');

        if (Number.isFinite(limit)) {
            builder.limit(limit, offset)
        }

        return builder.query();
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
                this.selected.set(item.xid, item);
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
