/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import componentTemplate from './resetPasswordCreateLink.html';
import './resetPasswordCreateLink.css';
import moment from 'moment-timezone';

class RestPasswordCreateLinkController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$element', 'maUser', '$document', 'maDialogHelper', '$interval']; }
    
    constructor($element, maUser, $document, maDialogHelper, $interval) {
        this.$element = $element;
        this.maUser = maUser;
        this.$document = $document;
        this.maDialogHelper = maDialogHelper;
        this.$interval = $interval;
        
        this.lockPassword = true;
        this.sendEmail = false;
        this.expiryPreset = '1_hours';
        this.updateExpiryDate();
    }

    $onInit() {
        this.intervalPromise = this.$interval(() => this.updateExpiryDate(), 1000);
    }

    $onChanges(changes) {
        if (changes && changes.user) {
            delete this.resetData;
        }
    }
    
    createLink(event) {
        this.$interval.cancel(this.intervalPromise);

        return this.maUser.createPasswordResetLink(this.user.username, this.lockPassword, this.sendEmail, this.expiryDate).then(data => {
            this.resetToken = data;
        }, error => {
            this.intervalPromise = this.$interval(() => this.updateExpiryDate(), 1000);
            this.maDialogHelper.errorToast(['users.errorCreatingResetToken', error.mangoStatusText]);
        });
    }

    copyToClipboard(event) {
        const textarea = this.$element[0].querySelector('textarea');
        textarea.focus();
        textarea.select();
        this.$document[0].execCommand("copy");
        this.maDialogHelper.toast(['common.copiedToClipboard']);
    }

    expiryDateChanged() {
        this.expiryPreset = null;
    }

    expiryPresetChanged() {
        this.updateExpiryDate();
    }

    updateExpiryDate() {
        if (this.expiryPreset) {
            const split = this.expiryPreset.split('_');
            this.expiryDate = moment().add(parseInt(split[0], 10), split[1]).toDate();
        }
    }
}

export default {
    controller: RestPasswordCreateLinkController,
    template: componentTemplate,
    bindings: {
        user: '<?'
    }
};