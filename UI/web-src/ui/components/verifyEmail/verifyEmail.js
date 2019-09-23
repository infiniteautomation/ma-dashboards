/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import verifyEmailTemplate from './verifyEmail.html';

class VerifyEmailController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maUser', '$stateParams', 'maDialogHelper', '$state']; }
    
    constructor(maUser, $stateParams, maDialogHelper, $state) {
        this.maUser = maUser;
        this.$stateParams = $stateParams;
        this.maDialogHelper = maDialogHelper;
        this.$state = $state;
    }
    
    $onInit() {
    }
    
    resetServerErrors() {
    }

    sendEmail() {
        this.form.$setSubmitted();
        if (this.form.$invalid) return;

        this.disableButton = true;
        return this.maUser.publicVerifyEmail(this.email).then(response => {
            this.maDialogHelper.toastOptions({
                textTr: ['login.emailVerification.emailSent', this.email],
                hideDelay: 10000
            });
            this.$state.go('verifyEmailToken');
        }, error => {
            this.maDialogHelper.toastOptions({
                textTr: ['login.emailVerification.errorSendingEmail', error.mangoStatusText],
                hideDelay: 10000,
                classes: 'md-warn'
            });
        }).finally(() => {
            this.disableButton = false;
        });
    }
}

export default {
    controller: VerifyEmailController,
    template: verifyEmailTemplate
};