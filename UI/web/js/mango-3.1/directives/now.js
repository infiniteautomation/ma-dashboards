/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['moment-timezone'], function(moment) {
'use strict';

function now($rootScope, Util, $interval) {
    return {
        scope: false,
        compile: function() {
    		var name = this.name;
    		return postLink.bind(null, name);
        }
    };
    
    function postLink(name, $scope, $element, attrs) {
    	var outputVariable = attrs[name] || attrs.output;
    	
    	attrs.$observe('updateInterval', function() {
        	startUpdateTimer();
        });
    	
        $scope.$on('$destroy', function() {
        	cancelUpdateTimer();
        });

        var intervalPromise;
        function startUpdateTimer() {
            cancelUpdateTimer();
            
            doUpdate();
            
            var millis = parseUpdateInterval(attrs.updateInterval);
            
            // dont allow continuous loops
            if (!millis) return;
            
            intervalPromise = $interval(doUpdate, millis);
        }
        
        function doUpdate() {
        	$scope[outputVariable] = moment();
        }
        
        function parseUpdateInterval(updateInterval) {
        	if (Util.isEmpty(updateInterval)) return;
            var parts = updateInterval.split(' ');
            if (parts.length < 2) return;
            if (Util.isEmpty(parts[0]) || Util.isEmpty(parts[1])) return;
            
            var duration = moment.duration(parseFloat(parts[0]), parts[1]);
            return duration.asMilliseconds();
        }

        function cancelUpdateTimer() {
        	if (intervalPromise) {
            	$interval.cancel(intervalPromise);
            	intervalPromise = null;
        	}
        }
    }
}

now.$inject = ['$rootScope', 'Util', '$interval'];

return now;

}); // define
