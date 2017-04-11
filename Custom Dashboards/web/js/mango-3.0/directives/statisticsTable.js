/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require'], function(require) {
'use strict';

function statisticsTable() {
    return {
        restrict: 'E',
        scope: {
            statistics: '=',
            hideStartsAndRuntimes: '@'
        },
        replace: true,
        templateUrl: require.toUrl('./statisticsTable.html')
    };
}

return statisticsTable;

}); // define
