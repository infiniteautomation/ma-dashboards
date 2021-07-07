/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import roleSelectorTemplate from './roleSelector.html';
import './roleSelector.css';

class RoleSelectorController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$scope', '$element', 'maRole']; }
    
    constructor($scope, $element, maRole) {
        this.$scope = $scope;
        this.$element = $element;
        this.maRole = maRole;

        this.selected = new Map();

        // maps Role to inherited Role[]
        this.inherited = new WeakMap();
        this.limit = 100;
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();

        this.maRole.notificationManager.subscribe((event, item, attributes) => {
            switch(event.name) {
                case 'create': {
                    // add to root
                    const matches = !this.filter || item.name.includes(this.filter.toLowerCase());
                    if (matches) {
                        this.addToRoot(item);
                    }
                    if (!this.filter) {
                        // need to remove the inherited roles from root (if they exist there)
                        item.inherited.forEach(xid => this.removeFromRoot(xid));
                    }
                    break;
                }
                case 'update': {
                    const existing = this.findRole(attributes.originalXid);
                    if (existing) {
                        Object.assign(existing, item);
                        existing.setOriginalId(item.xid);

                        this.updateInherited(existing);

                        if (!this.filter) {
                            // any inherited roles should not be in root
                            existing.inherited.forEach(xid => this.removeFromRoot(xid));
                        }
                    }
                    break;
                }
                case 'delete': {
                    // any roles which inherited the deleted role should get an update event, dont deal with that

                    // remove the role from the root if it exists there
                    this.removeFromRoot(item.xid);

                    if (!this.filter && item.inherited.length) {
                        // roles may no longer be inherited by any other role, they may be in the root now
                        this.reloadChildren(this.root);
                    }
                    break;
                }
            }
        }, this.$scope);
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

    findRole(xid, parent = this.root) {
        const children = this.inherited.get(parent);
        if (children) {
            for (const role of children) {
                if (role.xid === xid) {
                    return role;
                }

                // depth first search
                const found = this.findRole(xid, role);
                if (found) {
                    return found;
                }
            }
        }
    }

    removeFromRoot(xid) {
        const children = this.inherited.get(this.root);
        if (children) {
            const index = children.findIndex(r => r.xid === xid);
            if (index >= 0) {
                children.splice(index, 1);
                children.$total--;
            }
        }
    }

    addToRoot(role) {
        const children = this.inherited.get(this.root);
        if (children) {
            children.push(role);
            children.$total++;
            this.sortByName(children);
        }
    }

    updateInherited(role) {
        if (this.inherited.has(role)) {
            const children = this.inherited.get(role);

            let reloadRole = false;
            let reloadRoot = false;

            for (const xid of role.inherited) {
                if (!children.some(c => c.xid === xid)) {
                    // role was added to inherited
                    const cached = this.findRole(xid);
                    if (cached) {
                        children.push(cached);
                        children.$total++;
                    } else {
                        // a role was added that is not already in our cache, we will have to reload this role
                        reloadRole = true;
                    }
                }
            }

            for (const child of children) {
                if (!role.inherited.some(xid => xid === child.xid)) {
                    // role was removed from inherited
                    const i = children.indexOf(child);
                    children.splice(i, 1);
                    children.$total--;

                    // role may no longer be inherited by any other role, it may be in the root now
                    if (!this.filter) {
                        reloadRoot = true;
                    }
                }
            }

            this.sortByName(children);

            if (reloadRole) {
                this.reloadChildren(role);
            }
            if (reloadRoot) {
                this.reloadChildren(this.root);
            }
        }
    }

    sortByName(roles) {
        roles.sort((a, b) => {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return 0;
        });
        return roles;
    }

    loadRoles(isRoot, role, loadMore) {
        const cached = this.inherited.get(role);
        if (cached && !loadMore) {
            return cached;
        }

        const inherited = cached || [];
        if (inherited.$total == null) {
            inherited.$total = 0;
        }
        this.inherited.set(role, inherited);

        const builder = this.maRole.buildQuery();
        if (isRoot) {
            if (this.filter) {
                builder.match('name', `*${this.filter}*`);
            } else {
                builder.or()
                    .contains('inheritedBy', null)
                    .in('xid', ['anonymous', 'user', 'superadmin'])
                    .up();
            }
        } else {
            builder.contains('inheritedBy', role.xid);
        }

        builder.sort('name')
            .limit(this.limit, inherited.length);

        return builder.query().then(roles => {
            const mappedFromCache = roles.map(r => this.findRole(r.xid) || r);

            // should not need to sort, roles should be in order from REST API
            inherited.push(...mappedFromCache);
            inherited.$total = roles.$total;

            // only set the root here so that all the cache lookups can use the previous root up until this point
            if (isRoot) {
                this.root = role;
            }

            return inherited;
        });
    }

    reloadChildren(role) {
        const inherited = this.inherited.get(role);
        if (inherited) {
            const builder = this.maRole.buildQuery()
                .contains('inheritedBy', role.xid || null)
                .sort('name')
                .limit(this.limit);

            return builder.query().then(roles => {
                const mappedFromCache = roles.map(r => this.findRole(r.xid) || r);
                inherited.length = 0;
                inherited.push(...mappedFromCache);
                inherited.$total = roles.$total;
                return inherited;
            });
        }
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
        disabledOptions: '<?',
        limit: '<?'
    },
    controller: RoleSelectorController,
    template: roleSelectorTemplate
};
