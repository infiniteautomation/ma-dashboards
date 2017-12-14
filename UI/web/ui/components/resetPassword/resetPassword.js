/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require'], function(require) {
'use strict';

class ResetPasswordController {
    static get $inject() { return ['maUser', '$state', '$window', '$stateParams']; }
    
    constructor(maUser, $state, $window, $stateParams) {
        this.maUser = maUser;
        this.$state = $state;
        this.$window = $window;
        this.$stateParams = $stateParams;
        
        this.errors = {};
    }
    
    $onInit() {
        if (this.$stateParams.resetToken) {
            this.resetToken = this.$stateParams.resetToken;
            this.parseToken();
        }
    }
    
    parseToken() {
        let validToken = true;
        let expired = false;
        this.username = null;
        
        try {
            const parts = this.resetToken.split('.');
            const claims = parts[1];
            const jsonStr = atob(claims);
            this.claims = JSON.parse(jsonStr);
            
            this.username = this.claims.sub;
            if (Date.now() > this.claims.exp * 1000) {
                expired = true;
            }
            if (this.claims.typ !== 'pwreset') {
                validToken = false;
            }
        } catch (e) {
            validToken = false;
        }
        
        if (this.resetForm && this.resetForm.resetToken) {
            this.resetForm.resetToken.$setValidity('validToken', validToken);
            this.resetForm.resetToken.$setValidity('expired', !expired);
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
            this.errors.invalidLogin = false;
            if (error.status === 401) {
                this.errors.invalidLogin = true;
                this.errors.otherError = false;
            } else {
                this.errors.otherError = error.mangoStatusText;
            }
        });
    }
    
    doReset() {
        this.parseToken();
        this.resetForm.$setSubmitted();
        if (this.resetForm.$invalid) return;
        
        return this.maUser.passwordReset(this.resetToken, this.newPassword).then(response => {
            this.doLogin();
        }, error => {
            if (this.resetForm && this.resetForm.resetToken) {
                this.resetForm.resetToken.$setValidity('validToken', false);
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
