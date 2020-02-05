/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

PermissionsFactory.$inject = ['$http'];
function PermissionsFactory($http) {
    const allPermissionsUrl = '/rest/v2/users/permissions-groups';
    
    function Permissions() {
    }
    
    Permissions.getAll = function() {
        return $http({
            method: 'GET',
            url: allPermissionsUrl,
            headers: {
                'Accept': 'application/json'
            }
        }).then(function(response) {
            return response.data;
        });
    };

    return Permissions;
}

export default PermissionsFactory;
