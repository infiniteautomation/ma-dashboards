/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

SystemPermissionFactory.$inject = ['$http'];
function SystemPermissionFactory($http) {
    const permissionsUrl = '/rest/v2/system-permissions';
    
    class SystemPermission {
        constructor(options) {
            Object.assign(this, options);
        }
        
        static list() {
            return $http({
                method: 'GET',
                url: permissionsUrl
            }).then((response) => {
                return response.data.map(item => new this(item));
            });
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
