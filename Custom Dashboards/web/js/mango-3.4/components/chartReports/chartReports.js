/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 */

define(['angular', 'require'], function(angular, require) {
    'use strict';


    chartReportsController.$inject = ['$scope', '$timeout', 'Util'];

    function chartReportsController($scope, $timeout, Util) {
        var $ctrl = this;
    }

    return {
        bindings: {
            reportWatchlistXid: '@',
            dateBar: '='
        },
        controller: chartReportsController,
        templateUrl: require.toUrl('./chartReports.html')
    };
}); // define
