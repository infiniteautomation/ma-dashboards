/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import changePasswordTemplate from './changePassword.html';

class ChangePasswordController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maUser', '$stateParams', 'maDialogHelper', '$state', 'maUtil', 'maUiLoginRedirector']; }
    
    constructor(maUser, $stateParams, maDialogHelper, $state, maUtil, maUiLoginRedirector) {
        this.maUser = maUser;
        this.$stateParams = $stateParams;
        this.maDialogHelper = maDialogHelper;
        this.$state = $state;
        this.maUtil = maUtil;
        this.maUiLoginRedirector = maUiLoginRedirector;
    }
    
    $onInit() {
        if (this.$stateParams.credentialsExpired) {
            this.credentialsExpired = true;
        }
        if (this.$stateParams.username) {
            this.username = this.$stateParams.username;
        }
        if (this.$stateParams.password) {
            this.password = this.$stateParams.password;
        }
    }
    
    resetServerErrors() {
        delete this.serverError;
        this.form.newPassword.$setValidity('passwordChangeError', true);
        if (this.form.username) {
            this.form.username.$setValidity('badCredentials', true);
        }
        if (this.form.password) {
            this.form.password.$setValidity('badCredentials', true);
        }
    }

    changePassword() {
        this.form.$setSubmitted();
        if (this.form.$invalid) return;

        this.disableButton = true;
        
        return this.maUser.login({
            username: this.username,
            password: this.password,
            newPassword: this.newPassword
        }).$promise.then(user => {
            
            this.maDialogHelper.toastOptions({
                textTr: ['login.passwordChanged', this.username],
                hideDelay: 10000
            });
            
            return this.maUiLoginRedirector.redirect(user);
        }, error => {
            this.disableButton = false;
            
            this.serverError = error;
            
            if (error.status === 401 && error.data && error.data.mangoStatusName === 'PASSWORD_CHANGE_FAILED') {
                this.form.newPassword.$setValidity('passwordChangeError', false);
            } else if (error.status === 401 && error.data && error.data.mangoStatusName === 'BAD_CREDENTIALS') {
                if (this.form.username) {
                    this.form.username.$setValidity('badCredentials', false);
                }
                if (this.form.password) {
                    this.form.password.$setValidity('badCredentials', false);
                }
            } else {
                this.maDialogHelper.toastOptions({
                    textTr: ['login.errorChangingPassword', error.mangoStatusText],
                    hideDelay: 10000,
                    classes: 'md-warn'
                });
            }
        });
    }
}

export default {
    controller: ChangePasswordController,
    template: changePasswordTemplate
};


