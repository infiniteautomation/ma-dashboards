/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import requirejs from 'requirejs/require';


class ForgotPasswordController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maUser', '$stateParams', 'maDialogHelper', '$state']; }
    
    constructor(maUser, $stateParams, maDialogHelper, $state) {
        this.maUser = maUser;
        this.$stateParams = $stateParams;
        this.maDialogHelper = maDialogHelper;
        this.$state = $state;
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
            this.$state.go('resetPassword');
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
        });
    }
}

export default {
    controller: ForgotPasswordController,
    templateUrl: requirejs.toUrl('./forgotPassword.html')
};


