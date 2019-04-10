/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Luis Güette
 */

serialPortFactory.$inject = ['$http'];
function serialPortFactory($http) {
    
    const baseUrl = '/rest/v2/server/serial-ports';
    
    class SerialPort {
        static list() {
            return $http({
                method: 'GET',
                url: baseUrl
            }).then(response => {
                return response.data;
            });
        }
        
       
    }
    
    return SerialPort;
}

export default serialPortFactory;
