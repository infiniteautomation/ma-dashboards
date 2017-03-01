/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 */

define(['angular', 'require'], function(angular, require) {
    'use strict';


    executiveReportStoreController.$inject = ['$scope', '$timeout', 'Util'];

    function executiveReportStoreController($scope, $timeout, Util) {
        var $ctrl = this;
        var index = 0;

        $ctrl.$onInit = function() {
            $ctrl.localExecutiveReportList = {reports: []};
            $ctrl.executiveReportList = {reports: []};
            $ctrl.executiveReports = {reports: []};
        };

        $ctrl.deleteExecutiveReport = function() {
            console.log($ctrl.localExecutiveReportList);
            $ctrl.executiveReportListItem.$delete();

            $ctrl.localExecutiveReportList.reports = $ctrl.localExecutiveReportList.reports.filter(function(report) {
                return report.uid !== $ctrl.selectedExecutiveReport.uid;
            });

            $ctrl.executiveReports.reports = $ctrl.executiveReports.reports.filter(function(report) {
                return report.uid !== $ctrl.selectedExecutiveReport.uid;
            });

            $ctrl.selectedExecutiveReport = $ctrl.localExecutiveReportList.reports[0];
            index = 0;

            $ctrl.selectedChartReports = $ctrl.selectedExecutiveReport.chartReports;

            $ctrl.executiveReportsItem.$save();
        };

        $ctrl.addExecutiveReport = function() {
            delete $ctrl.executiveReportListItem;
            delete $ctrl.executiveReportList;
            
            $ctrl.localExecutiveReportList.reports.push({});
            index = $ctrl.localExecutiveReportList.reports.length-1;

            $ctrl.selectedExecutiveReport = $ctrl.localExecutiveReportList.reports[index];
            $ctrl.selectedExecutiveReport.uid = 'ExRpt-' + Util.uuid();

            $ctrl.selectedChartReports = [];

            $timeout(function() {
                angular.element(document.querySelector('#executive-report-name-input')).focus();
            }, 500);
        };

        $ctrl.reportChanged = function() {
            index = $ctrl.localExecutiveReportList.reports.indexOf($ctrl.selectedExecutiveReport);
            $ctrl.selectedChartReports =  $ctrl.selectedExecutiveReport.chartReports;
        };

        $ctrl.saveExecutiveReport = function() {
            $ctrl.selectedExecutiveReport.chartReports = $ctrl.selectedChartReports;

            $ctrl.executiveReportList.reports = angular.copy($ctrl.selectedExecutiveReport);

            $ctrl.executiveReportListItem.readPermission =  $ctrl.selectedExecutiveReport.readPermission;
            $ctrl.executiveReportListItem.$save();

            // Also add to executiveReportsItem, if it doesn't already exist
            var alreadyExistsIndex = $ctrl.executiveReports.reports.map(function(report) {
                return report.uid;
            }).indexOf($ctrl.selectedExecutiveReport.uid);

            if (alreadyExistsIndex === -1) {
                $ctrl.executiveReports.reports.push($ctrl.selectedExecutiveReport);

                $ctrl.executiveReportsItem.$save();
            }
            else {
                // exists so update name in case changed
                // console.log(alreadyExistsIndex)
                $ctrl.executiveReports.reports[alreadyExistsIndex].name = $ctrl.selectedExecutiveReport.name;
                $ctrl.executiveReports.reports[alreadyExistsIndex].readPermission = $ctrl.selectedExecutiveReport.readPermission;
                $ctrl.executiveReportsItem.$save();
            }
        };

        $scope.$watch('$ctrl.executiveReports.reports', function(newValue, oldValue) {
            if (newValue === undefined || oldValue === undefined) return;
            // console.log('watch executiveReports.reports', newValue, oldValue);

            if ( newValue.length && !oldValue.length) {
                $ctrl.localExecutiveReportList.reports = angular.copy($ctrl.executiveReports.reports);
                $ctrl.selectedExecutiveReport = $ctrl.localExecutiveReportList.reports[0];

                $ctrl.selectedChartReports = $ctrl.selectedExecutiveReport.chartReports;
            }
        });
    }

    return {
        bindings: {
            selectedChartReports: '='
        },
        controller: executiveReportStoreController,
        templateUrl: require.toUrl('./executiveReportStore.html')
    };
}); // define
