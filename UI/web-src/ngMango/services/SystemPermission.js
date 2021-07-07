/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

SystemPermissionFactory.$inject = ['$http', 'maRqlBuilder'];
function SystemPermissionFactory($http, maRqlBuilder) {
    const permissionsUrl = '/rest/latest/system-permissions';
    
    class SystemPermission {
        constructor(options) {
            Object.assign(this, options);
        }

        static query(queryObject) {
            const params = {};
            if (queryObject) {
                const rqlQuery = queryObject.toString();
                if (rqlQuery) {
                    params.rqlQuery = rqlQuery;
                }
            }
            
            return $http({
                url: permissionsUrl,
                method: 'GET',
                params: params
            }).then(response => {
                const items = response.data.items.map(item => {
                    return new this(item);
                });
                items.$total = response.data.total;
                return items;
            });
        }

        static buildQuery() {
            const builder = new maRqlBuilder();
            builder.queryFunction = (queryObj) => {
                return this.query(queryObj);
            };
            return builder;
        }

        get() {
            return $http({
                method: 'GET',
                url: permissionsUrl + '/' + encodeURIComponent(this.name),
            }).then((response) => {
                Object.assign(this, response.data);
                return this;
            });
        }
        
        save() {
            return $http({
                method: 'PUT',
                url: permissionsUrl + '/' + encodeURIComponent(this.name),
                data: this
            }).then((response) => {
                Object.assign(this, response.data);
                return this;
            });
        }
    }
    
    return SystemPermission;
}

export default SystemPermissionFactory;
