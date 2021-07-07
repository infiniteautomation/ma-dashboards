/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import verifyEmailTokenTemplate from './verifyEmailToken.html';
import moment from 'moment-timezone';

class VerifyEmailTokenController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maUser', '$stateParams', 'maDialogHelper', '$injector', 'maUtil', '$timeout']; }
    
    constructor(maUser, $stateParams, maDialogHelper, $injector, maUtil, $timeout) {
        this.maUser = maUser;
        this.$stateParams = $stateParams;
        this.maDialogHelper = maDialogHelper;
        this.$state = $injector.has('$state') && $injector.get('$state');
        this.maUiLoginRedirector = $injector.has('maUiLoginRedirector') && $injector.get('maUiLoginRedirector');
        this.maUtil = maUtil;
        this.$timeout = $timeout;
        
        this.serverErrors = {};
    }
    
    $onInit() {
        if (this.$stateParams.emailAddressVerificationToken) {
            this.token = this.$stateParams.emailAddressVerificationToken;
            this.parseToken();
            
            if (this.claims && this.claims.typ === 'emailverify' && this.claims.id != null) {
                this.autoVerifying = true;
                this.$timeout(() => {
                    // causes the error state to show
                    if (this.form && this.form.token) {
                        this.form.token.$setTouched(true);
                    }
                    
                    // auto submit the token
                    this.verifyToken();
                }, 500);
            }
        }
    }
    
    resetServerErrors() {
        if (this.form && this.form.token) {
            this.form.token.$setValidity('server', true);
        }
        this.serverErrors = {};
    }
    
    parseToken() {
        this.resetServerErrors();
        
        try {
            this.claims = this.maUtil.parseJwt(this.token);
            this.email = this.claims.sub;
            this.updateExpiry();
            this.checkForRegistrationToken();
        } catch (e) {
            this.claims = null;
            this.email = null;
        }
    }
    
    checkForRegistrationToken() {
        if (this.claims && this.claims.typ === 'emailverify' && this.claims.id == null) {
            if (typeof this.onUserToken === 'function') {
                this.onUserToken({$token: this.token, $claims: this.claims});
            } else if (this.$state) {
                this.$state.go('registerUser', {emailAddressVerificationToken: this.token});
            }
        }
    }

    verifyToken() {
        if (this.form) {
            this.form.$setSubmitted();
            if (!this.autoVerifying && this.form.$invalid) return;
        }

        this.disableButton = true;
        return this.maUser.publicUpdateEmail(this.token).then(user => {
            this.maDialogHelper.toastOptions({
                textTr: ['login.emailVerification.userEmailVerified', user.email, user.username],
                hideDelay: 10000
            });
            if (typeof this.onSuccess === 'function') {
                this.onSuccess({$token: this.token, $claims: this.claims, $email: this.email, $user: user, $state: this.$state});
            } else if (this.maUiLoginRedirector) {
                this.maUiLoginRedirector.redirect(user);
            }
        }, error => {
            delete this.autoVerifying;
            if (error.status === 400) {
                this.serverErrors.invalidToken = error.mangoStatusText;
                if (this.form && this.form.token) {
                    this.form.token.$setValidity('server', false);
                }
            } else {
                this.serverErrors.other = error.mangoStatusText;
            }
            this.maDialogHelper.toastOptions({
                textTr: ['login.emailVerification.errorVerifying', error.mangoStatusText],
                hideDelay: 10000,
                classes: 'md-warn'
            });
            if (typeof this.onError === 'function') {
                this.onError({$token: this.token, $claims: this.claims, $email: this.email, $error: error, $state: this.$state});
            }
        }).finally(() => {
            delete this.disableButton;
        });
    }
    
    updateExpiry(timeNow = moment()) {
        const expiration = moment(this.claims && this.claims.exp * 1000);
        this.expiration = expiration.format('LT z');
        this.expirationDuration = moment.duration(expiration.diff(timeNow)).humanize(true);
    }
}

export default {
    controller: VerifyEmailTokenController,
    template: verifyEmailTokenTemplate,
    bindings: {
        onSuccess: '&?',
        onError: '&?',
        onUserToken: '&?'
    },
    transclude: {
        links: '?a'
    }
};