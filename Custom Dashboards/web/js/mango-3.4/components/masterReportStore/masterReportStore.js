/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 */

define(['angular', 'require'], function(angular, require) {
    'use strict';


    masterReportStoreController.$inject = ['$scope', '$timeout', 'Util', 'User'];

    function masterReportStoreController($scope, $timeout, Util, User) {
        var $ctrl = this;
        var runAsNonAdmin = false;

        $ctrl.user = User;

        $ctrl.$onInit = function() {
            $ctrl.masterReports = {reports: []};

            if(!$ctrl.user.current.hasPermission('superadmin')) {
                $ctrl.nonAdminMasterReportList = {reports: []};
                runAsNonAdmin = true;

                return;
            }

            $ctrl.localMasterReportList = {reports: []};
        };

        $ctrl.deleteMasterReport = function() {
            // Remove via filtering on report.uid

            $ctrl.localMasterReportList.reports = $ctrl.localMasterReportList.reports.filter(function(report) {
                return report.uid !== $ctrl.selectedMasterReport.uid;
            });

            $ctrl.masterReports.reports = $ctrl.masterReports.reports.filter(function(report) {
                return report.uid !== $ctrl.selectedMasterReport.uid;
            });

            $ctrl.selectedMasterReport = $ctrl.localMasterReportList.reports[0];
            // $ctrl.selectedChartReports = $ctrl.selectedMasterReport.chartReports;

            $ctrl.masterReportsItem.$save();
        };

        $ctrl.addMasterReport = function() {
            $ctrl.localMasterReportList.reports.push({});
            var index = $ctrl.localMasterReportList.reports.length-1;

            $ctrl.selectedMasterReport = $ctrl.localMasterReportList.reports[index];
            $ctrl.selectedMasterReport.uid = 'MasterRpt-' + Util.uuid();

            // $ctrl.selectedChartReports = [];

            $timeout(function() {
                angular.element(document.querySelector('#master-report-name-input')).focus();
            }, 500);
        };

        $ctrl.reportChanged = function() {
            
        };

        $ctrl.saveMasterReport = function() {
            // $ctrl.selectedMasterReport.chartReports = $ctrl.selectedChartReports;

            // Make sure all exectuiveReports are readable by any user
            $ctrl.masterReportsItem.readPermission = 'user';

            // Also add to MasterReportsItem, if it doesn't already exist
            var alreadyExistsIndex = $ctrl.masterReports.reports.map(function(report) {
                return report.uid;
            }).indexOf($ctrl.selectedMasterReport.uid);

            if (alreadyExistsIndex === -1) {
                $ctrl.masterReports.reports.push($ctrl.selectedMasterReport);
                $ctrl.masterReportsItem.$save();
            }
            else {
                // exists so update name, readPermission, chartReports, in case changed
                // console.log(alreadyExistsIndex)
                $ctrl.masterReports.reports[alreadyExistsIndex].name = $ctrl.selectedMasterReport.name;
                $ctrl.masterReports.reports[alreadyExistsIndex].readPermission = $ctrl.selectedMasterReport.readPermission;
                $ctrl.masterReports.reports[alreadyExistsIndex].chartReports = $ctrl.selectedMasterReport.chartReports;
                $ctrl.masterReportsItem.$save();
            }
        };

        $scope.$watch('$ctrl.masterReports.reports', function(newValue, oldValue) {
            if (newValue === undefined || oldValue === undefined) return;
            // console.log('watch MasterReports.reports', newValue, oldValue);

            // Should run on initial fetch of all MasterReports from jsonStore
            if ( newValue.length && !oldValue.length) {
                if (runAsNonAdmin) {
                    $ctrl.nonAdminMasterReportList.reports = $ctrl.masterReports.reports.filter(function(report) {
                        return $ctrl.user.current.hasPermission(report.readPermission);
                    });
                    $ctrl.selectedMasterReport = $ctrl.nonAdminMasterReportList.reports[0];
                }
                else {
                    $ctrl.localMasterReportList.reports = angular.copy($ctrl.masterReports.reports);
                    $ctrl.selectedMasterReport = $ctrl.localMasterReportList.reports[0];
                }
            }
        });
    }

    return {
        bindings: {
            selectedMasterReport: '='
        },
        controller: masterReportStoreController,
        templateUrl: require.toUrl('./masterReportStore.html')
    };
}); // define
