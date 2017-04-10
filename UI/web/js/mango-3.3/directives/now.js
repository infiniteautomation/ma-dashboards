/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['moment-timezone'], function(moment) {
'use strict';
/**
 * @ngdoc directive
 * @name maDashboards.maNow
 * @restrict E
 * @description
 * `<ma-now update-interval="1 SECONDS" output="time"></ma-now>`
 * - This directive will output the current browser time as a timestamp.
 * - <a ui-sref="dashboard.examples.basics.clocksAndTimezones">View Demo</a>
 *
 * @param {object} output Variable to hold the outputted timestamp.
 * @param {string} update-interval The timestamp will update on this given interval.
 Format the interval duration as a string starting with a number followed by one of these units:
<ul>
    <li>years</li>
    <li>months</li>
    <li>weeks</li>
    <li>days</li>
    <li>hours</li>
    <li>minutes</li>
    <li>seconds</li>
    <li>milliseconds</li>
</ul>
 *
 * @usage
 * <ma-now update-interval="1 SECONDS" output="time"></ma-now>
 * <ma-clock style="width: 100%; height: 200px;" time="time1" text="Browser timezone">
</ma-clock>
 *
 */
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
