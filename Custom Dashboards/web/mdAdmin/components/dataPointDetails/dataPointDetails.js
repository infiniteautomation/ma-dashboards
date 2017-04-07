/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

DataPointDetailsController.$inject = ['$scope', '$element', '$stateParams', '$state', 'localStorageService', 'PointHierarchy', 'DateBar', 'User'];
function DataPointDetailsController($scope, $element, $stateParams, $state, localStorageService, PointHierarchy, DateBar, User) {

    this.dateBar = DateBar;
    this.User = User;
    
    this.chartType = 'smoothedLine';

    this.pointChanged = function(point) {
        if (!point) return;
        
        $scope.myPoint = point;
        var xid = point.xid;

        $state.go('.', {pointXid: xid}, {location: 'replace', notify: false});
        
        localStorageService.set('lastDataPointDetailsItem', {
            xid: xid
        });
        
        PointHierarchy.pathByXid({xid: xid}).$promise.then(function(response) {
            this.path = response;
        }.bind(this), function(response) {
            console.log('PointHierarchy.pathByXid Error', response);
        });
        
        var pointType = $scope.myPoint.pointLocator.dataType;
        this.dateBar.rollupTypesFilter = pointType === 'NUMERIC' ? {} : { nonNumeric: true };

        this.chartType = $scope.myPoint.amChartsGraphType();
    };

    this.$onInit = function() {
        if ($stateParams.pointXid) {
            // console.log($stateParams.pointXid);
            this.pointXid = $stateParams.pointXid;
        } else if ($stateParams.pointId) {
            // console.log(($stateParams.pointId));
            this.pointId = $stateParams.pointId;
        } else {
            // Attempt load pointXid from local storage
            var storedPoint = localStorageService.get('lastDataPointDetailsItem');
            if (storedPoint) {
                this.pointXid = storedPoint.xid;
                //console.log('Loaded', storedPoint.xid, 'from LocalStorage');
            }
        }
    };
}

return {
    controller: DataPointDetailsController,
    templateUrl: require.toUrl('./dataPointDetails.html')
};

}); // define