/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

loginRedirectorFactory.$inject = ['$state', '$window', '$location', 'maUser', 'maUiMenu'];
function loginRedirectorFactory($state, $window, $location, maUser, maUiMenu) {

    const basePath = '/ui/';
    
    class LoginRedirector {
        redirect(user = maUser.current) {
            // load the user menu after logging in and register the UI router states
            return maUiMenu.refresh(false, true)
            .then(null, error => null)
            .then(() => {
                if (this.savedState) {
                    this.goToSavedState();
                } else if (!user) {
                    $state.go('login');
                } else {
                    // loginRedirectUrl will contain the homeUrl if set, or the UI module configured start page if not
                    const redirectUrl = user.loginRedirectUrl || user.homeUrl;
                    delete user.loginRedirectUrl;
                    
                    if (redirectUrl) {
                        this.goToUrl(redirectUrl);
                    } else if (user.admin) {
                        $state.go('ui.settings.home');
                    } else {
                        $state.go('ui.dataPointDetails');
                    }
                }
                
                return user;
            });
        }

        handleUnknownPath(path) {
            const user = maUser.current;

            // prepend with basePath (stripping the leading /)
            path = path ? basePath + path.substr(1) : basePath;
            
            if (!user) {
                this.saveUrl(path);
                return '/login';
            }
            
            if (path === basePath) {
                // tried to navigate to /ui/
                
                // can't use loginRedirectUrl, only available at login
                const redirectUrl = user.homeUrl;
                if (redirectUrl && redirectUrl.startsWith(basePath)) {
                    return redirectUrl.substr(basePath.length - 1); // strip basePath from start of URL
                }
                return user.admin ? '/administration/home' : '/data-point-details/';
            }

            return '/not-found?path=' + encodeURIComponent(path);
        }
        
        goToSavedState() {
            const savedState = this.savedState;
            delete this.savedState;
            
            if (savedState.state) {
                $state.go(savedState.state, savedState.params);
            } else if (savedState.url) {
                this.goToUrl(savedState.url);
            }
        }
        
        goToUrl(url) {
            if (url.startsWith(basePath)) {
                $location.replace().url(url.substr(basePath.length - 1));
            } else if (url) {
                $window.location = url;
            }
        }
        
        saveCurrentState() {
            this.saveState($state.current.name, $state.params);
        }

        saveState(state, params) {
            this.savedState = {
                state,
                params: Object.assign({}, params)
            };
        }
        
        saveUrl(url) {
            this.savedState = {
                url
            };
        }
    }

    return new LoginRedirector();
}

export default loginRedirectorFactory;
