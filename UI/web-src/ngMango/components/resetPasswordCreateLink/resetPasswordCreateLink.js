/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import componentTemplate from './resetPasswordCreateLink.html';
import './resetPasswordCreateLink.css';

class RestPasswordCreateLinkController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$element', 'maUser', '$document', 'maUtil', 'maDialogHelper']; }
    
    constructor($element, maUser, $document, maUtil, maDialogHelper) {
        this.$element = $element;
        this.maUser = maUser;
        this.$document = $document;
        this.maUtil = maUtil;
        this.maDialogHelper = maDialogHelper;
        
        this.lockPassword = true;
        this.sendEmail = false;
    }

    $onChanges(changes) {
        if (changes && changes.user) {
            delete this.resetData;
        }
    }
    
    createLink(event) {
        return this.maUser.createPasswordResetLink(this.user.username, this.lockPassword, this.sendEmail).then(data => {
            this.resetToken = data;
            this.resetToken.claims = this.maUtil.parseJwt(this.resetToken.token);
        }, error => {
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

    tokenExpiry(relative) {
        const expiry = new Date(this.resetToken.claims.exp * 1000);
        return relative ? expiry - (new Date()) : expiry;
    }
}

export default {
    controller: RestPasswordCreateLinkController,
    template: componentTemplate,
    bindings: {
        user: '<?'
    }
};