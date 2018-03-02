/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import requirejs from 'requirejs/require';


LocalesFactory.$inject = ['$http'];
function LocalesFactory($http) {
    function Locales() {
    }

    Locales.prototype.get = function() {
        return $http.get(requirejs.toUrl('mangoUIModule/vendor/localeList.json')).then(function(response) {
            return response.data.sort((a, b) => {
                if (a.name < b.name) return -1;
                if (a.name > b.name) return 1;
                return 0;
            });
        }.bind(this));
    };

    return new Locales();
}

export default LocalesFactory;


