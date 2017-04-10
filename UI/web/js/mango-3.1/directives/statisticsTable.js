/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require'], function(require) {
'use strict';

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
