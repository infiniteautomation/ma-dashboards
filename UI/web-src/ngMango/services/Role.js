/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

roleFactory.$inject = ['maRestResource'];
function roleFactory(RestResource) {
    
    const baseUrl = '/rest/v2/roles';

    class Role extends RestResource {
        static get baseUrl() {
            return baseUrl;
        }

        static queryRootRoles() {
            const builder = new RqlBuilder();
            builder.queryFunction = (query, opts) => {
                return this.query(query, Object.assign({
                    url: baseUrl + '/root'
                }, opts))
            };
            return builder;
        }

        static queryInheritedRoles(xid) {
            const builder = new RqlBuilder();
            builder.queryFunction = (query, opts) => {
                return this.query(query, Object.assign({
                    url: baseUrl + '/inherited/' + encodeURIComponent(xid)
                }, opts))
            };
            return builder;
        }
    }
    
    return Role;
}

export default roleFactory;
