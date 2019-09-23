/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import resetPasswordTemplate from './resetPassword.html';

class ResetPasswordController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maUser', 'maUiLoginRedirector', '$stateParams', '$timeout', 'maDialogHelper', 'maUtil']; }
    
    constructor(maUser, maUiLoginRedirector, $stateParams, $timeout, maDialogHelper, maUtil) {
        this.maUser = maUser;
        this.maUiLoginRedirector = maUiLoginRedirector;
        this.$stateParams = $stateParams;
        this.$timeout = $timeout;
        this.maDialogHelper = maDialogHelper;
        this.maUtil = maUtil;
    }
    
    $onInit() {
        if (this.$stateParams.resetToken) {
            this.resetToken = this.$stateParams.resetToken;
            this.parseToken();
            
            this.$timeout(() => {
                // causes the error state to show
                this.resetForm.resetToken.$setTouched(true);
            }, 500);
            
        } else {
            this.showTokenInput = true;
        }
    }
    
    parseToken() {
        if (this.resetForm && this.resetForm.resetToken) {
            this.resetForm.resetToken.$setValidity('serverValid', true);
        }

        try {
            this.claims = this.maUtil.parseJwt(this.resetToken);
            this.username = this.claims.sub;
        } catch (e) {
            this.claims = null;
            this.username = null;
        }
    }
    
    doLogin() {
        return this.maUser.login({
            username: this.username,
            password: this.newPassword
        }).$promise.then(user => {
            return this.maUiLoginRedirector.redirect(user);
        }, error => {
            this.disableButton = false;
            this.showTokenInput = true;
            this.maDialogHelper.toastOptions({
                textTr: ['login.validation.invalidLogin'],
                hideDelay: 10000,
                classes: 'md-warn'
            });
        });
    }

    doReset() {
        this.parseToken();
        this.resetForm.resetToken.$validate();
        this.resetForm.$setSubmitted();

        if (this.resetForm.$invalid) return;

        this.disableButton = true;
        return this.maUser.passwordReset(this.resetToken, this.newPassword).then(response => {
            this.doLogin();
        }, error => {
            this.disableButton = false;
            this.showTokenInput = true;

            if (error.status === 400 && error.data && error.data.mangoStatusCode === 4005) {
                this.resetForm.resetToken.$setValidity('serverValid', false);
            } else {
                this.maDialogHelper.toastOptions({
                    textTr: ['login.errorResettingPassword', error.mangoStatusText],
                    hideDelay: 10000,
                    classes: 'md-warn'
                });
            }
        });
    }

    regExpEscape(s) {
        return String(s).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
    }
}

export default {
    controller: ResetPasswordController,
    template: resetPasswordTemplate
};


