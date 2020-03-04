/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

logFileFactory.$inject = ['$resource', 'maUtil'];
function logFileFactory($resource, maUtil) {

    const LogFile = $resource('/rest/v2/logging/log-files/:filename', {
        filename: data => data && data.filename
    }, {
        query: {
            method: 'GET',
            isArray: true,
            transformResponse: maUtil.transformArrayResponse,
            interceptor: {
                response: maUtil.arrayResponseInterceptor
            }
        }
    }, {
        idProperty: 'filename'
    });
    
    Object.assign(LogFile.prototype, {
        getDownloadUrl() {
            return `/rest/v2/logging/view/${encodeURIComponent(this.filename)}?download=true`;
        }
    });
    
    return LogFile;
}

export default logFileFactory;
