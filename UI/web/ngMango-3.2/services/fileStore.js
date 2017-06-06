/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

fileStore.$inject = ['$http'];
function fileStore($http) {
	var fileStoreUrl = '/v2/file-stores';
	
    function FileStore() {
    }

    FileStore.prototype.list = function() {
    	return $http({
    		method: 'GET',
    		url: fileStoreUrl,
    		headers: {
    			'Accept': 'application/json'
    		}
    	}).then(function(response) {
    		return response.data;
    	});
    };

    return new FileStore();
}

return fileStore;

}); // define
