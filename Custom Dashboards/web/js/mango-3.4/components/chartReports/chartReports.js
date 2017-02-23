/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 */

define(['angular', 'require'], function(angular, require) {
    'use strict';


    chartReportsController.$inject = ['$scope', '$timeout', 'Util', 'DateBar'];

    function chartReportsController($scope, $timeout, Util, DateBar) {
        var $ctrl = this;
        var index = 0;


        $ctrl.$onInit = function(changes) {
            $ctrl.localReportStore = {reports: []};
            $ctrl.reportStore = {reports: []};
        };

        $ctrl.$onChanges = function(changes) {
            // console.log(changes);
            if (changes.markerUid.currentValue) {
              $ctrl.reportJsonStoreXid = 'Rpt-' + $ctrl.markerUid;
            }
        };

        $ctrl.reportChanged = function() {
          index = $ctrl.localReportStore.reports.indexOf($ctrl.selectedReport);

          DateBar.data = $ctrl.selectedReport.dateBar.data;
        }

        $ctrl.saveReport = function() {
          $ctrl.selectedReport.dateBar.data = DateBar.data;
          $ctrl.reportStore.reports[index] = angular.copy($ctrl.selectedReport);
          $ctrl.reportStoreItem.$save();
        }

        $ctrl.addReport = function() {
          $ctrl.localReportStore.reports.push({});
          index = $ctrl.localReportStore.reports.length-1;

          $ctrl.selectedReport = $ctrl.localReportStore.reports[index];
          $ctrl.selectedReport.uid = 'Report-' + Util.uuid();

          $timeout(function() {
              angular.element(document.querySelector('#report-name-input')).focus();
          }, 500);
        }

        $ctrl.deleteReport = function() {

        }

        $scope.$watch('$ctrl.reportStore.reports', function(newValue, oldValue) {
            if (newValue === undefined || oldValue === undefined) return;
            // console.log('watch reportStore.reports', newValue, oldValue);

            if (newValue.length && !oldValue.length) {
                $ctrl.localReportStore.reports = angular.copy($ctrl.reportStore.reports);
                $ctrl.selectedReport = $ctrl.localReportStore.reports[0];

                DateBar.data = $ctrl.selectedReport.dateBar.data;
            }
        });
    }

    return {
        bindings: {
            reportWatchlistXid: '@',
            markerUid: '@',
            dateBar: '='
        },
        controller: chartReportsController,
        templateUrl: require.toUrl('./chartReports.html')
    };
}); // define
