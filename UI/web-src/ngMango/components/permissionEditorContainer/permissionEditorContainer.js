/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import permissionEditorContainerTemplate from './permissionEditorContainer.html';
import './permissionEditorContainer.css';

const localStorageKey = 'maPermissionEditorContainer';

class PermissionEditorContainerController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maPermission', 'localStorageService', '$element', '$transclude', 'maRole', '$scope']; }

    constructor(Permission, localStorageService, $element, $transclude, Role, $scope) {
        this.Permission = Permission;
        this.Minterm = Permission.Minterm;
        this.localStorageService = localStorageService;
        this.$element = $element;
        this.$transclude = $transclude;
        this.Role = Role;
        this.$scope = $scope;

        this.roleCache = Role.getCache();
        this.showFilter = false;
        this.editors = new Set();
    }

    $onInit() {
        this.roleCache.subscribe(this.$scope);
        this.loadSettings();

        const $table = this.$element.maFind('.ma-permission-editor-table');
        this.$transclude((clone, scope) => {
            Object.defineProperties(scope, {
                $filter: {get: () => this.filter},
                $minterms: {get: () => this.minterms},
                $container: {get: () => this}
            });
            $table.append(clone);
        }, $table);
    }

    loadSettings() {
        this.settings = this.localStorageService.get(localStorageKey) || {
            minterms: [['superadmin'], ['user'], ['anonymous']],
            advancedMode: false
        };

        this.minterms = this.settings.minterms.map(t => new this.Minterm(t));

        // fetch all the roles for the selected columns so we can display their names
        this.roleCache.loadItems([].concat(...this.settings.minterms)).then(() => {
            // remove columns for minterms with deleted roles
            this.minterms.filter(t => {
                return !t.roles.every(r => this.roleCache.has(r));
            }).forEach(t => {
                this.removeColumn(t);
            });
        });

        this.updateDisabledOptions();
    }

    saveSettings() {
        this.localStorageService.set(localStorageKey, this.settings);
    }

    register(editor) {
        this.editors.add(editor);
    }

    deregister(editor) {
        this.editors.delete(editor);
    }

    addColumn(minterm) {
        const i = this.minterms.findIndex(a => a.equals(minterm));
        if (i < 0) {
            this.minterms.push(minterm);
            this.editors.forEach(editor => editor.render());

            this.updateDisabledOptions();
            this.settings.minterms = this.minterms.map(t => t.toArray());
            this.saveSettings();
        }
    }

    removeColumn(minterm) {
        const i = this.minterms.findIndex(a => a.equals(minterm));
        if (i >= 0) {
            this.minterms.splice(i, 1);
            this.editors.forEach(editor => editor.render());

            this.updateDisabledOptions();
            this.settings.minterms = this.minterms.map(t => t.toArray());
            this.saveSettings();
        }
    }

    rolesChanged(dropDown) {
        if (!this.settings.advancedMode) {
            this.addRolesAsColumn(dropDown);
        }
    }

    addRolesAsColumn(dropDown) {
        if (this.roles) {
            const roles = Array.isArray(this.roles) ? this.roles : [this.roles];
            const roleXids = roles.map(role => {
                this.roleCache.set(role.xid, role);
                return role.xid;
            });
            this.addColumn(new this.Minterm(roleXids));
            dropDown.close();
        }
    }

    deleteRoles() {
        delete this.roles;
    }

    advancedModeChanged() {
        this.deleteRoles();
        this.saveSettings();
    }

    updateDisabledOptions() {
        this.disabledOptions = this.minterms.filter(t => t.size === 1).map(t => t.roles[0]);
    }

    filterChanged() {
        if (this.onFilterChanged) {
            this.onFilterChanged({$filter: this.filter});
        }
    }

    clearFilter() {
        delete this.filter;
        this.$element.maFind('[name=filter]').maFocus();
        this.filterChanged();
    }

    getRoleName(xid) {
        const role = this.roleCache.get(xid);
        return role && role.name || xid;
    }
}

export default {
    transclude: true,
    controller: PermissionEditorContainerController,
    template: permissionEditorContainerTemplate,
    bindings: {
        showFilter: '<?',
        onFilterChanged: '&?'
    }
};
