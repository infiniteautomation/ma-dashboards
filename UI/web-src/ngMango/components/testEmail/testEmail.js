/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import componentTemplate from './testEmail.html';

class TestEmailController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maUser', 'maDialogHelper']; }
    
    constructor(maUser, maDialogHelper) {
        this.maUser = maUser;
        this.maDialogHelper = maDialogHelper;
    }

    $onChanges(changes) {
        if (changes.sendEmail && this.sendEmail) {
            this.sendTestEmail();
        }
    }
    
    sendTestEmail() {
        const user = this.user || this.maUser.current;
        const p = user.sendTestEmail().then(response => {
            this.maDialogHelper.toastOptions({text: response.data});
        }, error => {
            this.maDialogHelper.errorToast(['ui.components.errorSendingEmail', user.email, error.mangoStatusText]);
        }).finally(() => {
            delete this.sendingEmail;
        });
        
        this.sendingEmail = {hidePromise: p};
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