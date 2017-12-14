/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require'], function(require) {
'use strict';

class ResetPasswordController {
    static get $inject() { return ['maUser', '$state', '$window', '$stateParams', '$timeout', 'maDialogHelper']; }
    
    constructor(maUser, $state, $window, $stateParams, $timeout, maDialogHelper) {
        this.maUser = maUser;
        this.$state = $state;
        this.$window = $window;
        this.$stateParams = $stateParams;
        this.$timeout = $timeout;
        this.maDialogHelper = maDialogHelper;
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
        
        this.claims = null;
        this.username = null;
        
        try {
            const parts = this.resetToken.split('.');
            const claims = parts[1];
            const jsonStr = atob(claims);
            this.claims = JSON.parse(jsonStr);
            this.username = this.claims.sub;
        } catch (e) {
        }
    }
    
    doLogin() {
        return this.maUser.login({
            username: this.username,
            password: this.newPassword
        }).$promise.then(user => {
            let redirectUrl = '/ui/';
            if (this.$state.loginRedirectUrl) {
                redirectUrl = this.$state.loginRedirectUrl;
            } else if (user.mangoDefaultUri) {
                redirectUrl = user.mangoDefaultUri;
            } else if (user.homeUrl) {
                // user.mangoDefaultUri should be user.homeUrl if it is set
                // just in case mangoDefaultUri is empty
                redirectUrl = user.homeUrl;
            }
            this.$window.location = redirectUrl;
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

return {
    controller: ResetPasswordController,
    templateUrl: require.toUrl('./resetPassword.html')
};

}); // define
