/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import fileStoreEditorTemplate from './fileStoreEditor.html';
import './fileStoreEditor.css';

class FileStoreEditorController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maFileStore', 'maDialogHelper']; }

    constructor(maFileStore, maDialogHelper) {
        this.maFileStore = maFileStore;
        this.maDialogHelper = maDialogHelper;
    }

    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
    }

    render() {
        const fileStore = this.ngModelCtrl.$viewValue;
        if (fileStore) {
            this.fileStore = fileStore.copy();
        } else {
            delete this.fileStore;
        }

        if (this.form) {
            this.form.$setPristine();
            this.form.$setUntouched();
        }
    }

    revert(event) {
        this.render();
    }

    save(event) {
        if (this.form) {
            this.form.$setSubmitted();
        }

        this.fileStore.save().then(fileStore => {
            this.ngModelCtrl.$setViewValue(fileStore);
            this.render();
        }).catch(error => {
            if (error) {
                this.maDialogHelper.errorToast(['ui.filestore.errorSaving', error.mangoStatusText]);
                if (error.status === 422) {
                    this.validationMessages = error.data.result.messages;
                }
            }
        });
    }

    delete(event) {
        this.maDialogHelper.confirm(event, 'ui.filestore.confirmDelete').then(() => {
            return this.fileStore.delete();
        }).then(() => {
            this.ngModelCtrl.$setViewValue(null);
            this.render();
        }).catch(error => {
            if (error) {
                this.maDialogHelper.errorToast(['ui.filestore.errorDeleting', error.mangoStatusText]);
            }
        });
    }
}

export default {
    controller: FileStoreEditorController,
    template: fileStoreEditorTemplate,
    bindings: {
    },
    require: {
        ngModelCtrl: 'ngModel'
    }
};
