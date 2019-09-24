/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import verifyEmailTokenTemplate from './verifyEmailToken.html';

class VerifyEmailTokenController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maUser', '$stateParams', 'maDialogHelper', '$injector', 'maUtil']; }
    
    constructor(maUser, $stateParams, maDialogHelper, $injector, maUtil) {
        this.maUser = maUser;
        this.$stateParams = $stateParams;
        this.maDialogHelper = maDialogHelper;
        this.$state = $injector.has('$state') && $injector.get('$state');
        this.maUtil = maUtil;
    }
    
    $onInit() {
        if (this.$stateParams.emailAddressVerificationToken) {
            this.token = this.$stateParams.emailAddressVerificationToken;
            this.parseToken();
        }
    }
    
    resetServerErrors() {
    }
    
    parseToken() {
        try {
            this.claims = this.maUtil.parseJwt(this.token);
            this.email = this.claims.sub;
        } catch (e) {
            this.claims = null;
            this.email = null;
        }
    }

    verifyToken() {
        this.form.$setSubmitted();
        if (this.form.$invalid) return;

        this.disableButton = true;
        return this.maUser.publicVerifyEmailToken(this.token).then(response => {
            this.maDialogHelper.toastOptions({
                textTr: ['login.emailVerification.userEmailVerified', response.data.email, response.data.username],
                hideDelay: 10000
            });
            if (typeof this.onSuccess === 'function') {
                this.onSuccess({$token: this.token, $claims: this.claims, $email: this.email, $response: response, $state: this.$state});
            } else if (this.$state) {
                this.$state.go('login');
            }
        }, error => {
            this.maDialogHelper.toastOptions({
                textTr: ['login.emailVerification.errorVerifying', error.mangoStatusText],
                hideDelay: 10000,
                classes: 'md-warn'
            });
            if (typeof this.onError === 'function') {
                this.onError({$token: this.token, $claims: this.claims, $email: this.email, $error: error, $state: this.$state});
            }
        }).finally(() => {
            this.disableButton = false;
        });
    }
}

export default {
    controller: VerifyEmailTokenController,
    template: verifyEmailTokenTemplate,
    bindings: {
        onSuccess: '&?',
        onError: '&?'
    },
    transclude: {
        links: '?a'
    }
};