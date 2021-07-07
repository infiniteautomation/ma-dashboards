/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

ScriptFactory.$inject = ['$http', '$q'];
function ScriptFactory($http, $q) {
    const scriptUrl = '/rest/latest/script';
    
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
