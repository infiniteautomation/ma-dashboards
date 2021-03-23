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

                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && registration.waiting === newWorker) {
                            maEventBus.publish(`maServiceWorkerHelper/installed`, this, newWorker);

                            maTranslate.trAll({
                                text: 'ui.app.uiUpdateAvailable',
                                actionText: 'ui.app.reload'
                            }).then(({text, actionText}) => {
                                const toast = $mdToast.simple()
                                    .textContent(text)
                                    .action(actionText)
                                    .position('bottom center')
                                    .hideDelay(60 * 1000);

                                return $mdToast.show(toast).then(accepted => {
                                    if (accepted) {
                                        this.reloadApp();
                                    }
                                }, () => null);
                            });
                        }
                    });
                });
            }, error => {
                $log.error('ServiceWorker registration failed', error);
            });

            $window.navigator.serviceWorker.addEventListener('controllerchange', () => {
                $window.location.reload();
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
