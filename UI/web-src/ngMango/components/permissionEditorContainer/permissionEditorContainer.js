/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import permissionEditorContainerTemplate from './permissionEditorContainer.html';
import './permissionEditorContainer.css';

class PermissionEditorContainerController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return []; }

    constructor() {
        this.editors = [];

        // TODO get from local storage or user settings
        this.minterms = [['superadmin'], ['user']];
        this.updateColumns();
    }

    register(editor) {
        this.editors.push(editor);
    }

    deregister(editor) {
        const i = this.editors.indexOf(editor);
        if (i >= 0) {
            this.editors.splice(i, 1);
        }
    }

    updateColumns() {
        this.columns = this.minterms.map(minterm => {
            return {
                minterm,
                id: minterm.join('&'),
                label: minterm.join(' & ')
            };
        });
    }

    addColumn(minterm) {
        const i = this.minterms.findIndex(a => {
            return this.mintermsEqual(a, minterm);
        });
        if (i < 0) {
            this.minterms.push(minterm);
            this.updateColumns();
            this.editors.forEach(editor => editor.render());
        }
    }

    removeColumn(minterm) {
        const i = this.minterms.findIndex(a => {
            return this.mintermsEqual(a, minterm);
        });
        if (i >= 0) {
            this.minterms.splice(i, 1);
            this.updateColumns();
            this.editors.forEach(editor => editor.render());
        }
    }

    mintermsEqual(a, b) {
        return a.length === b.length && a.every(r => b.includes(r));
    }
}

export default {
    transclude: true,
    controller: PermissionEditorContainerController,
    template: permissionEditorContainerTemplate
};
