/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import componentTemplate from './testEmail.html';
import './testEmail.css';

class TestEmailController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maUser', 'maDialogHelper', '$q']; }
    
    constructor(maUser, maDialogHelper, $q) {
        this.maUser = maUser;
        this.maDialogHelper = maDialogHelper;
        this.$q = $q;
    }

    $onChanges(changes) {
        if (changes.sendEmail && this.sendEmail) {
            this.sendTestEmail();
        }
    }
    
    sendTestEmail() {
        const user = this.user || this.maUser.current;
        const hide = this.$q.defer();
        const opts = this.sendingEmail = {hidePromise: hide.promise, user};
        
        user.sendTestEmail().then(response => {
            this.maDialogHelper.toastOptions({text: response.data});
            hide.resolve();
        }, error => {
            if (error.data.smtpSessionLog) {
                opts.error = error;
            } else {
                this.maDialogHelper.errorToast(['ui.components.errorSendingEmail', user.email, error.mangoStatusText]);
                hide.resolve();
            }
        });
    }
}

export default {
    controller: TestEmailController,
    template: componentTemplate,
    bindings: {
        hideButton: '<?',
        user: '<?',
        sendEmail: '<?'
    }
};