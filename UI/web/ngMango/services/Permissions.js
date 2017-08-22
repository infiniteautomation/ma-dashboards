/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require', 'angular'], function(require, angular) {
'use strict';

const uiModulePermissions = Object.freeze(['edit-ui-menus', 'edit-ui-pages', 'edit-ui-settings']);

PermissionsFactory.$inject = ['$http'];
function PermissionsFactory($http) {
    var allPermissionsUrl = '/rest/v1/users/permissions-groups';
    
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
            const seen = {};
            return response.data.concat(uiModulePermissions).filter((permission) => {
                return seen[permission] ? false : (seen[permission] = true);
            });
        });
    };

    return Permissions;
}

return PermissionsFactory;

});
