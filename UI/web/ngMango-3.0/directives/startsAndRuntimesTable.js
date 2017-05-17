/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require'], function(require) {
'use strict';
/**
 * @ngdoc directive
 * @name ngMango.directive:maStartsAndRuntimesTable
 * @restrict E
 * @description
 * `<ma-set-point-value point="myPoint"></ma-set-point-value>`
 * - Displays `starts` and `runtimes` in a table for a `statistics` object of a multistate or binary data point.
 * - Used internally withing `<ma-statistics-table>` directive.
 *
 * @param {object} starts-and-runtimes Input `statistics.startsAndRuntimes`.
 *
 * @usage
 * <tr md-row ng-if="statistics.startsAndRuntimes && !hideStartsAndRuntimes" class="statistics-summary">
     <td md-cell ma-tr="common.stats.summary"></td>
     <td md-cell colspan="2">
         <ma-starts-and-runtimes-table starts-and-runtimes="statistics.startsAndRuntimes"></ma-starts-and-runtimes-table>
     </td>
 </tr>
 *
 */
function startsAndRuntimesTable($injector) {
    return {
        restrict: 'E',
        scope: {
        	startsAndRuntimes: '='
        },
        replace: true,
        templateUrl: function() {
            if ($injector.has('$mdUtil')) {
                return require.toUrl('./startsAndRuntimesTable-md.html');
            }
            return require.toUrl('./startsAndRuntimesTable.html');
        }
    };
}

startsAndRuntimesTable.$inject = ['$injector'];

return startsAndRuntimesTable;

}); // define
