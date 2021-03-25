/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

roleFactory.$inject = ['maRestResource'];
function roleFactory(RestResource) {
    
    const baseUrl = '/rest/latest/roles';
    const webSocketUrl = '/rest/latest/websocket/roles';
    const xidPrefix = 'ROLE_';

    class Role extends RestResource {
        static get baseUrl() {
            return baseUrl;
        }

        static get webSocketUrl() {
            return webSocketUrl;
        }

        static get xidPrefix() {
            return xidPrefix;
        }

        static createCache() {
            const cache = super.createCache();
            cache.maxSize = 256;
            return cache;
        }
    }

    Object.assign(Role.notificationManager, {
        supportsSubscribe: true
    });

    return Role;
}

export default roleFactory;
