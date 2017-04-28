/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['moment-timezone'], function(moment) {
'use strict';
/**
 * @ngdoc directive
 * @name ngMango.maNow
 * @restrict E
 * @description
 * `<ma-now update-interval="1 SECONDS" output="time"></ma-now>`
 * - This directive will output the current browser time as a Moment.js date object.
 * - <a ui-sref="ui.examples.basics.clocksAndTimezones">View Demo</a>
 *
 * @param {object} output Variable to hold the output date.
 * @param {object} browserTimezone set to the browsers timezone (guessed)
 * @param {string} update-interval The date will update on this given interval.
 * @param {string} time-zone The output date will have the given timezone.
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
function now() {
    return {
        scope: {
            output: '=?',
            browserTimezone: '=?',
            updateInterval: '@',
            timeZone: '@',
            onChange: '&?'
        },
        restrict: 'E',
        controllerAs: '$ctrl',
        bindToController: true,
        controller: ['maUtil', '$interval', function nowController(Util, $interval) {
            this.browserTimezone = moment.tz.guess();
            
            this.$onChanges = function(changes) {
                if (changes.updateInterval) {
                    this.startUpdateTimer();
                }
            };

            this.$onDestroy = function() {
                this.cancelUpdateTimer();
            };

            this.startUpdateTimer = function startUpdateTimer() {
                this.cancelUpdateTimer();
                this.doUpdate();

                var millis = parseUpdateInterval(this.updateInterval);

                // dont allow continuous loops
                if (!millis) return;

                this.intervalPromise = $interval(this.doUpdate, millis);
            };

            this.cancelUpdateTimer = function cancelUpdateTimer() {
                if (this.intervalPromise) {
                    $interval.cancel(this.intervalPromise);
                    this.intervalPromise = null;
                }
            };
            
            this.doUpdate = function doUpdate() {
                var m = moment();
                if (this.timeZone) {
                    m.tz(this.timeZone);
                }
                this.output = m;
                if (this.onChange) {
                    this.onChange({$value: m});
                }
            }.bind(this);

            function parseUpdateInterval(updateInterval) {
                if (Util.isEmpty(updateInterval)) return;
                var parts = updateInterval.split(' ');
                if (parts.length < 2) return;
                if (Util.isEmpty(parts[0]) || Util.isEmpty(parts[1])) return;

                var duration = moment.duration(parseFloat(parts[0]), parts[1]);
                return duration.asMilliseconds();
            }
        }]
    };
}

now.$inject = [];
return now;

}); // define
