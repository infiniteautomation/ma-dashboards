/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require'], function(require) {
'use strict';

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
