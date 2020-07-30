/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

roleFactory.$inject = ['maRestResource', 'maRqlBuilder'];
function roleFactory(RestResource, RqlBuilder) {
    
    const baseUrl = '/rest/latest/roles';

    class Role extends RestResource {
        static get baseUrl() {
            return baseUrl;
        }
    }
    
    return Role;
}

export default roleFactory;
