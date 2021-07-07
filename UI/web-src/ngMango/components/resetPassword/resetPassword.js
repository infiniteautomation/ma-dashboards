/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import resetPasswordTemplate from './resetPassword.html';

class ResetPasswordController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maUser', '$timeout', 'maDialogHelper', 'maUtil', '$injector']; }
    
    constructor(maUser, $timeout, maDialogHelper, maUtil, $injector) {
        this.maUser = maUser;
        this.$timeout = $timeout;
        this.maDialogHelper = maDialogHelper;
        this.maUtil = maUtil;
        this.$state = $injector.has('$state') && $injector.get('$state');
        this.$stateParams = $injector.has('$stateParams') && $injector.get('$stateParams');
        this.maUiLoginRedirector = $injector.has('maUiLoginRedirector') && $injector.get('maUiLoginRedirector');
    }
    
    $onInit() {
        if (this.$stateParams && this.$stateParams.resetToken) {
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
            if (typeof this.onSuccess === 'function') {
                this.onSuccess({$user: this.user, $state: this.$state});
            } else if (this.maUiLoginRedirector) {
                this.maUiLoginRedirector.redirect(user);
            }
        }, error => {
            this.disableButton = false;
            this.showTokenInput = true;
            this.maDialogHelper.toastOptions({
                textTr: ['login.validation.invalidLogin'],
                hideDelay: 10000,
                classes: 'md-warn'
            });
            
            if (typeof this.onError === 'function') {
                this.onError({$token: this.resetToken, $claims: this.claims, $username: this.username, $error: error, $state: this.$state});
            }
        });
    }

    doReset() {
        this.parseToken();
        this.resetForm.resetToken.$validate();
        this.resetForm.$setSubmitted();

        if (this.resetForm.$invalid) return;

        this.disableButton = true;
        this.maUser.passwordReset(this.resetToken, this.newPassword).then(response => {
            if (typeof this.onReset === 'function') {
                this.onReset({$response: this.response, $state: this.$state});
            } else {
                this.doLogin();
            }
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
            
            if (typeof this.onError === 'function') {
                this.onError({$resetError: true, $token: this.resetToken, $claims: this.claims, $username: this.username, $error: error, $state: this.$state});
            }
        });
    }

    regExpEscape(s) {
        return String(s).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
    }
}

export default {
    controller: ResetPasswordController,
    template: resetPasswordTemplate,
    bindings: {
        onReset: '&?',
        onSuccess: '&?',
        onError: '&?'
    },
    transclude: {
        links: '?a'
    }
};


