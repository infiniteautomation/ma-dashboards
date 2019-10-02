/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import loginTemplate from './login.html';

class LoginController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maUser', '$injector']; }
    
    constructor(maUser, $injector) {
        this.maUser = maUser;
        this.$state = $injector.has('$state') && $injector.get('$state');
        this.maUiLoginRedirector = $injector.has('maUiLoginRedirector') && $injector.get('maUiLoginRedirector');
        this.maUiServerInfo = $injector.has('maUiServerInfo') && $injector.get('maUiServerInfo');
        
        this.errors = {};
        this.publicRegistrationEnabled = this.maUiServerInfo && this.maUiServerInfo.publicRegistrationEnabled || false;
    }
    
    resetServerErrors() {
        delete this.errors.invalidLogin;
    }
    
    doLogin() {
        this.loggingIn = true;

        const credentials = {
            username: this.username,
            password: this.password
        };
        
        this.maUser.login(credentials).$promise.then(user => {
            if (typeof this.onSuccess === 'function') {
                this.onSuccess({$user: user, $state: this.$state});
            } else if (this.$state) {
                this.maUiLoginRedirector.redirect(user);
            }
        }, error => {
            this.errors.invalidLogin = false;
            if (error.status === 401) {
                if (this.$state && typeof this.onError !== 'function' && error.data && error.data.mangoStatusName === 'CREDENTIALS_EXPIRED') {
                    this.$state.go('changePassword', Object.assign({credentialsExpired: true}, credentials));
                } else {
                    this.errors.invalidLogin = true;
                    this.errors.otherError = false;
                    this.invalidLoginMessage = error.mangoStatusText;
                }
            } else {
                this.errors.otherError = error.mangoStatusText;
                delete this.invalidLoginMessage;
            }
            
            if (typeof this.onError === 'function') {
                this.onError({$credentials: this.credentials, $error: error, $state: this.$state});
            }
        }).finally(() => {
            delete this.loggingIn;
        });
    }
}

export default {
    controller: LoginController,
    template: loginTemplate,
    bindings: {
        onSuccess: '&?',
        onError: '&?',
        publicRegistrationEnabled: '<?'
    },
    transclude: {
        links: '?a',
        loggedIn: '?maLoggedIn'
    }
};