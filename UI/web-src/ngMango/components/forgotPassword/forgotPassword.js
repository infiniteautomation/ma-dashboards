/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import forgotPasswordTemplate from './forgotPassword.html';

class ForgotPasswordController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maUser', '$stateParams', 'maDialogHelper', '$injector']; }
    
    constructor(maUser, $stateParams, maDialogHelper, $injector) {
        this.maUser = maUser;
        this.$stateParams = $stateParams;
        this.maDialogHelper = maDialogHelper;
        this.$state = $injector.has('$state') && $injector.get('$state');
    }
    
    $onInit() {
        if (this.$stateParams.username) {
            this.username = this.$stateParams.username;
        }
    }
    
    resetServerErrors() {
        this.forgotForm.username.$setValidity('userExists', true);
        this.forgotForm.email.$setValidity('emailMatches', true);
    }

    sendEmail() {
        this.forgotForm.$setSubmitted();
        if (this.forgotForm.$invalid) return;

        this.disableButton = true;
        return this.maUser.sendPasswordResetEmail(this.username, this.email).then(response => {
            this.maDialogHelper.toastOptions({
                textTr: ['login.emailSent', this.email],
                hideDelay: 10000
            });
            if (typeof this.onSuccess === 'function') {
                this.onSuccess({$emailAddress: this.email, $username: this.username, $response: response, $state: this.$state});
            } else if (this.$state) {
                this.$state.go('resetPassword');
            }
        }, error => {
            this.disableButton = false;

            if (error.status === 404) {
                this.forgotForm.username.$setValidity('userExists', false);
            } else if (error.status === 400 && error.data && error.data.mangoStatusCode === 4005) {
                this.forgotForm.email.$setValidity('emailMatches', false);
            } else {
                this.maDialogHelper.toastOptions({
                    textTr: ['login.errorSendingEmail', error.mangoStatusText],
                    hideDelay: 10000,
                    classes: 'md-warn'
                });
            }
            if (typeof this.onError === 'function') {
                this.onError({$emailAddress: this.email, $username: this.username, $error: error, $state: this.$state});
            }
        });
    }
}

export default {
    controller: ForgotPasswordController,
    template: forgotPasswordTemplate,
    bindings: {
        onSuccess: '&?',
        onError: '&?'
    },
    transclude: {
        links: '?a'
    }
};