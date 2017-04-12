/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

EventsPageController.$inject = ['$scope', '$mdMedia', '$stateParams', '$state', 'localStorageService', 'DateBar', 'uiSettings'];
function EventsPageController($scope, $mdMedia, $stateParams, $state, localStorageService, DateBar, uiSettings) {
    
    var $ctrl = this;
    $ctrl.$mdMedia = $mdMedia;
    $ctrl.dateBar = DateBar;
    $ctrl.uiSettings = uiSettings;
    
    $ctrl.$onInit = function() {
        
        if ($stateParams.sortOrder) {
            console.log($stateParams.sortOrder);
            $ctrl.sort = $stateParams.sortOrder;
        }
        else {
            $ctrl.sort = '-activeTimestamp';
        }
        
        if ($stateParams.eventType) {
            // console.log($stateParams.eventType);
            $ctrl.eventType = $stateParams.eventType;
        }
        else {
            // Attempt load from local storage
            var storedEventType = localStorageService.get('lastEventTypeItem');
            if (storedEventType) {
                $ctrl.eventType = storedEventType;
            }
            else {
                // Otherwise set to all
                $ctrl.eventType = '*';
            }
        }
        
        if ($stateParams.alarmLevel) {
            // console.log($stateParams.alarmLevel);
            $ctrl.alarmLevel = $stateParams.alarmLevel;
        }
        else {
            // Attempt load from local storage
            var storedAlarmLevel = localStorageService.get('lastAlarmLevelItem');
            if (storedAlarmLevel) {
                $ctrl.alarmLevel = storedAlarmLevel;
            }
            else {
                // Otherwise set to all
                $ctrl.alarmLevel = '*';
            }
        }
        
        if ($stateParams.acknowledged) {
            // console.log($stateParams.acknowledged);
            $ctrl.acknowledged = $stateParams.acknowledged;
        }
        else {
            // Attempt load from local storage
            var storedAcknowledged = localStorageService.get('acknowledged');
            if (storedAcknowledged) {
                $ctrl.acknowledged = storedAcknowledged;
            }
            else {
                // Otherwise set to all
                $ctrl.acknowledged = '*';
            }
        }
        
        if ($stateParams.dateFilter) {
            $ctrl.dateFilter = $stateParams.dateFilter;
        }
        else {
            // Attempt load from local storage
            var storedDateFilter = localStorageService.get('dateFilter');
            
            if (storedDateFilter) {
                $ctrl.dateFilter = storedDateFilter;
            }
            else {
                // Otherwise set to false
                $ctrl.dateFilter = false;
            }
        }
        
        $scope.$watch('$ctrl.eventType', function(newValue, oldValue) {
            if (newValue === undefined || newValue === oldValue) return;
            
            $state.go('.', {eventType: newValue}, {location: 'replace', notify: false});
            localStorageService.set('lastEventTypeItem', newValue);
        });
        
        $scope.$watch('$ctrl.alarmLevel', function(newValue, oldValue) {
            if (newValue === undefined || newValue === oldValue) return;
            
            $state.go('.', {alarmLevel: newValue}, {location: 'replace', notify: false});
            localStorageService.set('lastAlarmLevelItem', newValue);
        });
        
        $scope.$watch('$ctrl.acknowledged', function(newValue, oldValue) {
            if (newValue === undefined || newValue === oldValue) return;
            
            $state.go('.', {acknowledged: newValue}, {location: 'replace', notify: false});
            localStorageService.set('acknowledged', newValue);
        });
        
        $scope.$watch('$ctrl.dateFilter', function(newValue, oldValue) {
            if (newValue === undefined) return;
            
            $state.go('.', {dateFilter: newValue}, {location: 'replace', notify: false});
            localStorageService.set('dateFilter', newValue);
            
            if (newValue === false) {
                $state.go('.', {dateBar: false}, {location: 'replace', notify: false});
            }
            else {
                $state.go('.', {dateBar: {rollupControls: false}}, {location: 'replace', notify: false});
            }
        });
        
    };
}

return {
    controller: EventsPageController,
    templateUrl: require.toUrl('./eventsPage.html')
};

}); // define