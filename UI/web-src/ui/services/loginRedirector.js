/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

function loginRedirectorProvider () {
    let lastUpgradeTime = null;
    
    this.setLastUpgradeTime = function(_lastUpgradeTime) {
        lastUpgradeTime = _lastUpgradeTime;
    };
    this.$get = loginRedirectorFactory;

    loginRedirectorFactory.$inject = ['$state', '$window', '$location', 'maUser', 'maUiMenu'];
    function loginRedirectorFactory($state, $window, $location, maUser, maUiMenu) {

        const basePath = '/ui/';
        
        class LoginRedirector {
            redirect(user = maUser.current) {
                // load the user menu after logging in and register the UI router states
                return maUiMenu.refresh(false, true)
                .then(null, error => null)
                .then(() => {
                    let reload = false;
                    let redirectUrl = null;
                    
                    if (user) {
                        if (user.lastUpgradeTime != null && user.lastUpgradeTime !== lastUpgradeTime) {
                            lastUpgradeTime = user.lastUpgradeTime;
                            reload = true;
                        }
    
                        // loginRedirectUrl will contain the homeUrl if set, or the UI module configured start page if not
                        redirectUrl = user.loginRedirectUrl || user.homeUrl;
                        
                        // remove tmp properties
                        delete user.loginRedirectUrl;
                        delete user.lastUpgradeTime;
                    }
                    
                    if (this.savedState) {
                        this.goToSavedState(reload);
                    } else if (!user) {
                        this.goToState('login', {}, reload);
                    } else {
                        if (redirectUrl) {
                            this.goToUrl(redirectUrl, reload);
                        } else if (user.admin) {
                            this.goToState('ui.settings.home', {}, reload);
                        } else {
                            this.goToState('ui.dataPointDetails', {}, reload);
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
            
            goToSavedState(reload = false) {
                const savedState = this.savedState;
                delete this.savedState;
                
                if (savedState.state) {
                    this.goToState(savedState.state, savedState.params, reload);
                } else if (savedState.url) {
                    this.goToUrl(savedState.url, reload);
                }
            }
            
            goToState(state, parameters = {}, reload = false) {
                if (reload) {
                    const href = $state.href(state, parameters);
                    $window.location = href;
                } else {
                    $state.go(state, parameters);
                }
            }
            
            goToUrl(url, reload = false) {
                if (!reload && url.startsWith(basePath)) {
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
}

export default loginRedirectorProvider;
