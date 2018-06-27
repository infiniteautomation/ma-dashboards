/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

loginRedirectorFactory.$inject = ['$state', '$window', '$location', 'maUser'];
function loginRedirectorFactory($state, $window, $location, maUser) {

    const basePath = '/ui/';
    
    class LoginRedirector {
        redirect(user = maUser.current) {
            if (this.savedState) {
                this.goToSavedState();
            } else if (!user) {
                $state.go('login');
            } else {
                const redirectUrl = user.mangoDefaultUri || user.homeUrl;
                
                if (redirectUrl) {
                    this.goToUrl(redirectUrl);
                } else if (user.admin) {
                    $state.go('ui.settings.home');
                } else {
                    $state.go('ui.dataPointDetails');
                }
            }
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
                
                // mango default URI will contain the homeUrl if it exists, or the mango start page if it doesn't
                // so prefer using it if it exists (only exists when doing login)
                const redirectUrl = user.mangoDefaultUri || user.homeUrl;
                if (redirectUrl && redirectUrl.startsWith(basePath)) {
                    return '/' + redirectUrl.substr(basePath.length); // strip basePath from start of URL
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
                $location.replace().url(url.substr(basePath.length));
            } else if (url) {
                $window.location = url;
            }
        }

        saveState(state, params) {
            this.savedState = {
                state,
                params
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
