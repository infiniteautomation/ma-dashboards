/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import startsAndRuntimesTableMdTemplate from './startsAndRuntimesTable-md.html';
import startsAndRuntimesTableTemplate from './startsAndRuntimesTable.html';

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
 * <tr md-row ng-if="statistics.startsAndRuntimes && !hideStartsAndRuntimes" class="ma-statistics-summary">
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
        template: function() {
            if ($injector.has('$mdUtil')) {
                return startsAndRuntimesTableMdTemplate;
            }
            return startsAndRuntimesTableTemplate;
        },
        designerInfo: {
            translation: 'ui.components.maStartAndRuntimesTable',
            icon: 'grid_on'
        }
    };
}

startsAndRuntimesTable.$inject = ['$injector'];

export default startsAndRuntimesTable;
