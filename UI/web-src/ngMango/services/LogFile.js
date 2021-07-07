/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

logFileFactory.$inject = ['$resource', 'maUtil', '$http'];
function logFileFactory($resource, maUtil, $http) {

    const LogFile = $resource('/rest/latest/logging/log-files/:filename', {
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
            return `/rest/latest/logging/download?filename=${encodeURIComponent(this.filename)}`;
        },
        
        getContents() {
            return $http({
                method: 'GET',
                url: `/rest/latest/logging/view/${encodeURIComponent(this.filename)}`
            }).then(r => r.data);
        }
    });
    
    return LogFile;
}

export default logFileFactory;
