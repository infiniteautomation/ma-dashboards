/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import loginTemplate from './login.html';
import './login.css';

class LoginController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maUser', '$injector']; }
    
    constructor(maUser, $injector) {
        this.maUser = maUser;
        this.$state = $injector.has('$state') && $injector.get('$state');
        this.$stateParams = $injector.has('$stateParams') && $injector.get('$stateParams');
        this.maUiLoginRedirector = $injector.has('maUiLoginRedirector') && $injector.get('maUiLoginRedirector');
        this.maUiServerInfo = $injector.has('maUiServerInfo') && $injector.get('maUiServerInfo');
        
        this.errors = {};
        this.publicRegistrationEnabled = this.maUiServerInfo && this.maUiServerInfo.publicRegistrationEnabled || false;

        maUser.getOAuth2Clients().then(clients => {
             this.oauth2Clients = clients;
        });
    }

    $onInit() {
        if (this.$stateParams) {
            if (this.$stateParams.username) {
                this.username = this.$stateParams.username;
            }
            if (this.$stateParams.error) {
                this.errors.authenticationError = this.$stateParams.error;
            }
            this.$state.go('.', {username: null, error: null}, {notify: false, reload: false});
        }
    }
    
    resetErrors() {
        this.errors = {};
    }
    
    doLogin() {
        this.resetErrors();
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
                this.redirecting = true;
            }
        }, error => {
            if (error.status === 401) {
                if (this.$state && typeof this.onError !== 'function' && error.data && error.data.mangoStatusName === 'CREDENTIALS_EXPIRED') {
                    this.$state.go('changePassword', Object.assign({credentialsExpired: true}, credentials));
                } else {
                    this.errors.invalidLogin = error.mangoStatusText;
                }
            } else {
                this.errors.otherError = error.mangoStatusText;
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