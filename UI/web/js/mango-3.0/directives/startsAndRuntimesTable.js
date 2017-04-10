/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require'], function(require) {
'use strict';

function startsAndRuntimesTable() {
    return {
        restrict: 'E',
        scope: {
        	startsAndRuntimes: '='
        },
        replace: true,
        templateUrl: require.toUrl('./startsAndRuntimesTable.html')
    };
}

return startsAndRuntimesTable;

}); // define
