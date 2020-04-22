/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

ScriptFactory.$inject = ['$http', '$q'];
function ScriptFactory($http, $q) {
    const scriptUrl = '/rest/v2/script';
    
    class Script {
        static scriptEngines() {
            return $http({
                url: `${scriptUrl}/engines`
            }).then(response => {
                return response.data;
            });
        }
        
        eval() {
            return $http({
                method: 'POST',
                url: `${scriptUrl}/eval`,
                responseType: 'blob',
                transformResponse: angular.identity,
                timeout: 0
            }).then(response => {
                return response.data;
            });
        }
    }

    return Script;
}

export default ScriptFactory;
