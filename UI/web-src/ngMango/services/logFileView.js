/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Pier Puccini
 */

logFileViewFactory.$inject = ['$http'];
function logFileViewFactory($http) {
    
    const baseUrl = '/rest/v2';
    
    class logFileView {
        static getFilename(url) {
            return $http({
                method: 'GET',
                url: baseUrl + url
            }).then(response => {
                return response.data;
            });
        }
    }
    
    return logFileView;
}

export default logFileViewFactory;
