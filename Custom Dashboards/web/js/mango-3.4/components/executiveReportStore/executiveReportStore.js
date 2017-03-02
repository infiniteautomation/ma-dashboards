/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 */

define(['angular', 'require'], function(angular, require) {
    'use strict';


    executiveReportStoreController.$inject = ['$scope', '$timeout', 'Util', 'User'];

    function executiveReportStoreController($scope, $timeout, Util, User) {
        var $ctrl = this;
        var runAsNonAdmin = false;

        $ctrl.user = User;

        $ctrl.$onInit = function() {
            $ctrl.executiveReports = {reports: []};

            if(!$ctrl.user.current.hasPermission('superadmin')) {
                $ctrl.nonAdminExecutiveReportList = {reports: []};
                runAsNonAdmin = true;

                return;
            }

            $ctrl.localExecutiveReportList = {reports: []};
        };

        $ctrl.deleteExecutiveReport = function() {
            
            // Remove via filtering on report.uid

            $ctrl.localExecutiveReportList.reports = $ctrl.localExecutiveReportList.reports.filter(function(report) {
                return report.uid !== $ctrl.selectedExecutiveReport.uid;
            });

            $ctrl.executiveReports.reports = $ctrl.executiveReports.reports.filter(function(report) {
                return report.uid !== $ctrl.selectedExecutiveReport.uid;
            });

            $ctrl.selectedExecutiveReport = $ctrl.localExecutiveReportList.reports[0];
            $ctrl.selectedChartReports = $ctrl.selectedExecutiveReport.chartReports;

            $ctrl.executiveReportsItem.$save();
        };

        $ctrl.addExecutiveReport = function() {
            $ctrl.localExecutiveReportList.reports.push({});
            var index = $ctrl.localExecutiveReportList.reports.length-1;

            $ctrl.selectedExecutiveReport = $ctrl.localExecutiveReportList.reports[index];
            $ctrl.selectedExecutiveReport.uid = 'ExRpt-' + Util.uuid();

            $ctrl.selectedChartReports = [];

            $timeout(function() {
                angular.element(document.querySelector('#executive-report-name-input')).focus();
            }, 500);
        };

        $ctrl.reportChanged = function() {
            $ctrl.selectedChartReports =  $ctrl.selectedExecutiveReport.chartReports;
        };

        $ctrl.saveExecutiveReport = function() {
            $ctrl.selectedExecutiveReport.chartReports = $ctrl.selectedChartReports;

            // Make sure all exectuiveReports are readable by any user
            $ctrl.executiveReportsItem.readPermission = 'user';

            // Also add to executiveReportsItem, if it doesn't already exist
            var alreadyExistsIndex = $ctrl.executiveReports.reports.map(function(report) {
                return report.uid;
            }).indexOf($ctrl.selectedExecutiveReport.uid);

            if (alreadyExistsIndex === -1) {
                $ctrl.executiveReports.reports.push($ctrl.selectedExecutiveReport);
                $ctrl.executiveReportsItem.$save();
            }
            else {
                // exists so update name, readPermission, chartReports, in case changed
                // console.log(alreadyExistsIndex)
                $ctrl.executiveReports.reports[alreadyExistsIndex].name = $ctrl.selectedExecutiveReport.name;
                $ctrl.executiveReports.reports[alreadyExistsIndex].readPermission = $ctrl.selectedExecutiveReport.readPermission;
                $ctrl.executiveReports.reports[alreadyExistsIndex].chartReports = $ctrl.selectedExecutiveReport.chartReports;
                $ctrl.executiveReportsItem.$save();
            }
        };

        $scope.$watch('$ctrl.executiveReports.reports', function(newValue, oldValue) {
            if (newValue === undefined || oldValue === undefined) return;
            // console.log('watch executiveReports.reports', newValue, oldValue);

            // Should run on initial fetch of all executiveReports from jsonStore
            if ( newValue.length && !oldValue.length) {
                if (runAsNonAdmin) {
                    $ctrl.nonAdminExecutiveReportList.reports = $ctrl.executiveReports.reports.filter(function(report) {
                        return $ctrl.user.current.hasPermission(report.readPermission);
                    });
                    $ctrl.selectedExecutiveReport = $ctrl.nonAdminExecutiveReportList.reports[0];
                }
                else {
                    $ctrl.localExecutiveReportList.reports = angular.copy($ctrl.executiveReports.reports);
                    $ctrl.selectedExecutiveReport = $ctrl.localExecutiveReportList.reports[0];
                }
                
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
