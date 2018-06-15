/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';


SystemActionsFactory.$inject = ['$http', '$q', '$timeout'];
function SystemActionsFactory($http, $q, $timeout) {
    const systemActionsUrl = '/rest/v2/actions';
    
    function SystemActionResource(data) {
    	angular.extend(this, data);
    }
    
    SystemActionResource.prototype.refresh = function() {
    	return $http({
            method: 'GET',
            url: systemActionsUrl + '/status/' + encodeURIComponent(this.resourceId)
        }).then(function(response) {
        	return angular.extend(this, response.data);
        }.bind(this));
    };
    
    SystemActionResource.prototype.refreshUntilFinished = function(timeout) {
    	if (this.finished) return $q.resolve(this);
    	return $timeout(function() {
    		return this.refresh();
    	}.bind(this), timeout || 1000).then(function() {
    		return this.refreshUntilFinished(timeout);
    	}.bind(this));
    };
    
    function SystemActions() {
    }

    SystemActions.trigger = function(name, content) {
        return $http({
            method: 'PUT',
            url: systemActionsUrl + '/trigger/' + encodeURIComponent(name),
            data: content
        }).then(function(response) {
        	return new SystemActionResource(response.data);
        });
    };

    return SystemActions;
}

export default SystemActionsFactory;


