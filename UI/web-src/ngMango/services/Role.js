/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

roleFactory.$inject = ['maRestResource', 'maRqlBuilder'];
function roleFactory(RestResource, RqlBuilder) {
    
    const baseUrl = '/rest/v2/roles';

    class Role extends RestResource {
        static get baseUrl() {
            return baseUrl;
        }

        static queryRootRoles() {
            const builder = new RqlBuilder();
            builder.queryFunction = (query, opts) => {
                return this.http({
                    url: baseUrl + '/root',
                    params: {
                        rqlQuery: query && query.toString()
                    }
                }, opts).then(response => {
                    const items = response.data.items.map(item => {
                        return new this(item);
                    });
                    items.$total = response.data.total;
                    return items;
                });
            };
            return builder;
        }

        static queryInheritedRoles(xid) {
            const builder = new RqlBuilder();
            builder.queryFunction = (query, opts) => {
                return this.http({
                    url: baseUrl + '/inherited/' + this.encodeUriSegment(xid),
                    params: {
                        rqlQuery: query && query.toString()
                    }
                }, opts).then(response => {
                    const items = response.data.items.map(item => {
                        return new this(item);
                    });
                    items.$total = response.data.total;
                    return items;
                });
            };
            return builder;
        }
        
        queryInheritedRoles() {
            return this.constructor.queryInheritedRoles(this.xid);
        }
    }
    
    return Role;
}

export default roleFactory;
