/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

DataPointDetailsController.$inject = ['$scope', '$element', '$stateParams', '$state', 'localStorageService', 'mdAdminSettings', 'PointHierarchy', 'DateBar', 'User'];
function DataPointDetailsController($scope, $element, $stateParams, $state, localStorageService, mdAdminSettings, PointHierarchy, DateBar, User) {

    this.dateBar = DateBar;
    this.mdAdminSettings = mdAdminSettings;
    this.User = User;
    var pointValueCell = $element.find('.point-details .point-value');
    var pointTimeCell = $element.find('.point-details .point-time');
    var timeoutID;
    var lastValue;
    
    this.chartType = 'smoothedLine';

    this.pointValueChanged = function pointValueChanged(point) {
        // remove old points time
        delete this.pointTime;

        if (!point || !point.enabled) return;
        
        // manually add and remove classes rather than using ng-class as point values can
        // change rapidly and result in huge slow downs / heaps of digest loops

        var now = (new Date()).valueOf();
        var format = now - point.time > 86400 ? 'shortDateTimeSeconds' : 'timeSeconds';
        this.pointTime = mdAdminSettings.formatDate(point.time, format);

        pointTimeCell.addClass('flash-on-change');
        if (point.value !== lastValue) {
            pointValueCell.addClass('flash-on-change');
        }
        lastValue = point.value;
        
        if (timeoutID) {
            clearTimeout(timeoutID);
            timeoutID = null;
        }

        timeoutID = setTimeout(function() {
            pointValueCell.removeClass('flash-on-change');
            pointTimeCell.removeClass('flash-on-change');
        }, 400);
    };
    
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