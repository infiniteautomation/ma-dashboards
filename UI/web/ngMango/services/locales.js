/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

LocalesFactory.$inject = ['$http'];
function LocalesFactory($http) {
    function Locales() {
    }

    Locales.prototype.get = function() {
        return $http.get(require.toUrl('mangoUIModule/vendor/localeList.json')).then(function(response) {
            return response.data.sort((a, b) => {
                if (a.name < b.name) return -1;
                if (a.name > b.name) return 1;
                return 0;
            });
        }.bind(this));
    };

    return new Locales();
}

return LocalesFactory;

}); // define
