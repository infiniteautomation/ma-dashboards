/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

serviceWorkerHelperFactory.$inject = ['$window', '$log', 'maEventBus', 'maTranslate', '$mdToast'];
function serviceWorkerHelperFactory($window, $log, maEventBus, maTranslate, $mdToast) {

    /**
     * Service worker uses workbox to precache files from the webpack build and also cache module resources
     * on the fly.
     *
     * Criteria for prompting to install the application -
     * https://developers.google.com/web/fundamentals/app-install-banners/#criteria
     */

    class ServiceWorkerHelper {
        constructor() {
            if ('serviceWorker' in $window.navigator) {
                this.registerServiceWorker();
            }
        }

        registerServiceWorker() {
            $window.navigator.serviceWorker.register('/ui/serviceWorker.js', {
                // allow getting imported files from disk cache since our webpack manifest hash will always change
                // and the workbox version will change too
                updateViaCache: 'imports'
            }).then(registration => {
                this.registration = registration;

                // setup an hourly check for a new service worker
                setInterval(() => {
                    registration.update();
                }, 60 * 60 * 1000);

                let hadActiveWorker = !!registration.active;

                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    maEventBus.publish(`maServiceWorkerHelper/updatefound`, newWorker);
                    newWorker.addEventListener('statechange', () => {
                        maEventBus.publish(`maServiceWorkerHelper/statechange/${newWorker.state}`, newWorker);
                        if (newWorker.state === 'installed') {
                            // only prompt for reload if there was previously an active worker
                            if (hadActiveWorker && registration.waiting === newWorker) {
                                maTranslate.trAll({
                                    text: 'login.ui.uiUpdateAvailable',
                                    actionText: 'login.ui.reload'
                                }).then(({text, actionText}) => {
                                    const toast = $mdToast.simple()
                                        .textContent(text)
                                        .action(actionText)
                                        .position('bottom center')
                                        .hideDelay(false);

                                    return $mdToast.show(toast).then(accepted => {
                                        if (accepted) {
                                            this.reloadApp();
                                        }
                                    }, () => null);
                                });
                            }
                        } else if (newWorker.state === 'activated') {
                            hadActiveWorker = true;
                        }
                    });
                });

                // prevents infinite reloads when Chrome's "Update on reload" feature is enabled
                let reloading = false;
                $window.navigator.serviceWorker.addEventListener('controllerchange', () => {
                    maEventBus.publish(`maServiceWorkerHelper/controllerchange`, registration.active);
                    // only reload if there was previously an active worker
                    if (hadActiveWorker && !reloading) {
                        reloading = true;
                        $window.location.reload();
                    }
                });
            }, error => {
                $log.error('ServiceWorker registration failed', error);
            });
        }

        get updateAvailable() {
            return !!(this.registration && this.registration.waiting);
        }

        update() {
            if (this.registration) {
                this.registration.update();
            }
        }

        reloadApp() {
            if (this.registration && this.registration.waiting) {
                this.registration.waiting.postMessage({type: 'SKIP_WAITING'});
            }
        }
    }

    return new ServiceWorkerHelper();
}

export default serviceWorkerHelperFactory;
