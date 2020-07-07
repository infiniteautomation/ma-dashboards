/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import permissionEditorContainerTemplate from './permissionEditorContainer.html';
import './permissionEditorContainer.css';

class PermissionEditorContainerController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maPermission']; }

    constructor(Permission) {
        this.Permission = Permission;
        this.Minterm = Permission.Minterm;

        this.editors = new Set();

        // TODO get from local storage or user settings
        this.minterms = [['superadmin'], ['user']].map(t => new this.Minterm(t));
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
        }
    }

    removeColumn(minterm) {
        const i = this.minterms.findIndex(a => a.equals(minterm));
        if (i >= 0) {
            this.minterms.splice(i, 1);
            this.editors.forEach(editor => editor.render());
        }
    }

    rolesChanged(dropDown) {
        if (!this.advancedMode) {
            this.addRolesAsColumn(dropDown);
        }
    }

    addRolesAsColumn(dropDown) {
        if (this.roles && this.roles.length) {
            this.addColumn(new this.Minterm(this.roles));
            dropDown.close();
        }
    }

    deleteRoles() {
        delete this.roles;
    }
}

export default {
    transclude: true,
    controller: PermissionEditorContainerController,
    template: permissionEditorContainerTemplate
};
