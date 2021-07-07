/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import verifyEmailTemplate from './verifyEmail.html';

class VerifyEmailController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maUser', '$stateParams', 'maDialogHelper', '$injector']; }
    
    constructor(maUser, $stateParams, maDialogHelper, $injector) {
        this.maUser = maUser;
        this.$stateParams = $stateParams;
        this.maDialogHelper = maDialogHelper;
        this.$state = $injector.has('$state') && $injector.get('$state');
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
            if (typeof this.onSuccess === 'function') {
                this.onSuccess({$emailAddress: this.email, $response: response, $state: this.$state});
            } else if (this.$state) {
                this.$state.go('verifyEmailToken');
            }
        }, error => {
            this.maDialogHelper.toastOptions({
                textTr: ['login.emailVerification.errorSendingEmail', error.mangoStatusText],
                hideDelay: 10000,
                classes: 'md-warn'
            });
            if (typeof this.onError === 'function') {
                this.onError({$emailAddress: this.email, $error: error, $state: this.$state});
            }
        }).finally(() => {
            this.disableButton = false;
        });
    }
}

export default {
    controller: VerifyEmailController,
    template: verifyEmailTemplate,
    bindings: {
        onSuccess: '&?',
        onError: '&?'
    },
    transclude: {
        links: '?a'
    }
};