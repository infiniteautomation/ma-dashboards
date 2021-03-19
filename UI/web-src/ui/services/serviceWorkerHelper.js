/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

// check why images aren't being cached and loaded while offline
// cache oauth providers (network first)


serviceWorkerHelperFactory.$inject = ['$window', '$log', 'maEventBus', 'maDialogHelper'];
function serviceWorkerHelperFactory($window, $log, maEventBus, maDialogHelper) {

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

                // TODO listen for restart/update event and update SW registration
                // TODO dont delete old caches until updated - see what work box does e.g.
                // workbox During precaching cleanup, 2 cached requests were deleted.
                // logger.js:48 Deleted Cache Requests
                // logger.js:48 https://mango.jazdw.net:8443/ui/index.html?__WB_REVISION__=61d120515c22dddb99e8dda3ef6e7969
                // logger.js:48 https://mango.jazdw.net:8443/ui/mangoUi.js?v=0cadea55ab86a1abe480

                // setup an hourly check for a new service worker
                setInterval(() => {
                    registration.update();
                }, 60 * 60 * 1000);

                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && registration.waiting === newWorker) {
                            maEventBus.publish(`maServiceWorkerHelper/installed`, this, newWorker);

                            maDialogHelper.confirm(null, {
                                textContent: 'ui.app.updateAppDescription',
                                areYouSure: 'ui.app.appUpdated',
                                okText: 'ui.app.reload',
                            }).then(() => {
                                this.reloadApp();
                            }, () => null);
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
