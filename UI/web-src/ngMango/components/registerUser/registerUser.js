/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import registerUserTemplate from './registerUser.html';
import moment from 'moment-timezone';

class RegisterUserController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maUser', '$stateParams', 'maDialogHelper', '$injector', 'maUtil']; }
    
    constructor(maUser, $stateParams, maDialogHelper, $injector, maUtil) {
        this.maUser = maUser;
        this.$stateParams = $stateParams;
        this.maDialogHelper = maDialogHelper;
        this.$state = $injector.has('$state') && $injector.get('$state');
        this.maUtil = maUtil;

        this.serverErrors = {};
        this.user = new this.maUser();
    }
    
    $onInit() {
        if (this.$stateParams.emailAddressVerificationToken) {
            this.token = this.$stateParams.emailAddressVerificationToken;
            this.parseToken();
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
            this.user.email = this.claims.sub;
            this.updateExpiry();
        } catch (e) {
            this.claims = null;
        }
    }

    registerUser() {
        this.form.$setSubmitted();
        if (this.form.$invalid) return;
        
        delete this.validationMessages;
        this.disableButton = true;
        
        // registration uses V2 model
        const userCopy = Object.assign({}, this.user);
        userCopy.permissions = this.user.permissions.split(/\s*,\s*/).filter(p => !!p);
        
        return this.maUser.publicRegisterUser(this.token, userCopy).then(user => {
            this.maDialogHelper.toastOptions({
                textTr: ['login.userRegistration.success', user.username],
                hideDelay: 10000
            });
            if (typeof this.onSuccess === 'function') {
                this.onSuccess({$token: this.token, $claims: this.claims, $user: user, $state: this.$state});
            } else if (this.$state) {
                this.$state.go('login');
            }
        }, error => {
            if (error.status === 400) {
                this.serverErrors.invalidToken = error.mangoStatusText;
                if (this.form && this.form.token) {
                    this.form.token.$setValidity('server', false);
                }
            } else if (error.status === 422) {
                this.serverErrors.other = error.mangoStatusText;
                this.validationMessages = error.data.result.messages;
            } else {
                this.serverErrors.other = error.mangoStatusText;
            }
            this.maDialogHelper.toastOptions({
                textTr: ['login.userRegistration.error', error.mangoStatusText],
                hideDelay: 10000,
                classes: 'md-warn'
            });
            if (typeof this.onError === 'function') {
                this.onError({$token: this.token, $claims: this.claims, $user: this.user, $error: error, $state: this.$state});
            }
        }).finally(() => {
            this.disableButton = false;
        });
    }
    
    updateExpiry(timeNow = moment()) {
        const expiration = moment(this.claims && this.claims.exp * 1000);
        this.expiration = expiration.format('LT z');
        this.expirationDuration = moment.duration(expiration.diff(timeNow)).humanize(true);
    }
}

export default {
    controller: RegisterUserController,
    template: registerUserTemplate,
    bindings: {
        onSuccess: '&?',
        onError: '&?'
    },
    transclude: {
        links: '?a'
    }
};