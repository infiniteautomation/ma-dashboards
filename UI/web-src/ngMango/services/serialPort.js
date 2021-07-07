/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

serialPortFactory.$inject = ['$http'];
function serialPortFactory($http) {
    
    const baseUrl = '/rest/latest/server/serial-ports';
    
    class SerialPort {
        static list(params = {}) {
            return $http({
                method: 'GET',
                url: baseUrl,
                params: params
            }).then(response => {
                return response.data;
            });
        }
        
       
    }
    
    return SerialPort;
}

export default serialPortFactory;
