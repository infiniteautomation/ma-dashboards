/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require'], function(require) {
'use strict';
/**
 * @ngdoc directive
 * @name maDashboards.maStatisticsTable
 * @restrict E
 * @description
 * `<ma-statistics-table statistics="statsObj"></ma-statistics-table>`
 * - `<ma-statistics-table>` will display a formatted data table with the values and timestamps from a `statistics` object.
 * - <a ui-sref="dashboard.examples.statistics.statisticsTable">View Demo</a> 
 *
 * @param {object} statistics Input the statistics object from `<ma-point-statistics>`
 * @param {boolean=} hide-starts-and-runtimes If set to `false`, `starts` and `runtimes` statistics will not display for a binary/multistate point
 (Defaults to `true`)
 *
 * @usage
 * <ma-point-statistics point="myPoint" from="from" to="to" statistics="statsObj"></ma-point-statistics>
<ma-statistics-table statistics="statsObj"></ma-statistics-table>
 *
 */
function statisticsTable($injector) {
    return {
        restrict: 'E',
        scope: {
            statistics: '=',
            hideStartsAndRuntimes: '@'
        },
        replace: true,
        templateUrl: function() {
            if ($injector.has('$mdUtil')) {
                return require.toUrl('./statisticsTable-md.html');
            }
            return require.toUrl('./statisticsTable.html');
        }
    };
}

statisticsTable.$inject = ['$injector'];

return statisticsTable;

}); // define
