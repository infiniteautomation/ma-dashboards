/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require', 'rql/query', 'moment-timezone'], function(angular, require, query, moment) {
'use strict';
/**
 * @ngdoc directive
 * @name maDashboards.maEventsTable
 * @restrict E
 * @description
 * `<ma-events-table></ma-events-table>`
 * - Displays a list of Events in a table format.
 * - Allows for filtering of events by several attributes as explained below.
 * - Can be set to query for events within a specific date range.
 * - The table includes the ability to filter and sort by alarm level and timestamp.
 * - Events can be acknowledged one at a time or a button is shown to acknowledge all events matching the query.
 * - Note in usage examples below raw string literals are wrapped in single quotes where as variable names / numbers / booleans are not.
 * - <a ui-sref="dashboard.examples.utilities.eventsTable">View Demo</a>
 *
 * @param {number} limit Set the initial limit of the pagination.
 * @param {string=} point-id Filter on the Id property of a point, use with `"single-point=true"`.
 * @param {boolean=} single-point Set to `"true"` and use with point-id attribute to return events related to just a single Data Point.
 * @param {number=} event-id Filter on a specific Event Id, should return a single event.
 * @param {string=} alarm-level Filter on Alarm Level. Possible values are: `"'NONE'"`, `"'INFORMATION'"`, `"'IMPORTANT'"`, `"'WARNING'"`, `"'URGENT'"`, `"'CRITICAL'"`, `"'LIFE_SAFETY'"` or `"'*'"` for any.
 * @param {string=} event-type Filter on Event Type. Possible values are: `"'DATA_POINT'"`, `"'DATA_SOURCE'"`, `"'SYSTEM'"` or `"'*'"` for any.
 * @param {string=} acknowledged Filter on whether the event has been acknowledged. Possible values are: `"'true'"`, `"'false'"` or `"'*'"` for either.
 * @param {string=} active-status Filter on Active Status. Possible values are: `"'active'"`, `"'noRtn'"`, `"'normal'"` or `"'*'"` for any.
 * @param {string=} sort Set the initial sorting column of the table. Possible values are: `"'alarmLevel'"`, `"'activeTimestamp'"`, `"'message'"` or `"'acknowledged'"`. Precede value with a negative (eg. `"'-activeTimestamp'"`) to reverse sorting.
 * @param {string=} from From time used for filtering by date range. Pass the value from a `<ma-date-picker>`.
 * @param {string=} to To time used for filtering by date range.
 * @param {boolean=} date-filter Turn on date filtering of events. Set value to `"'true'"` and use with from/to attribute to use. Defaults to off.
 * @param {string=} timezone Display the timestamps in this timezone

 *
 * @usage
 * <!-- Example Using filters on Table Attributes -->
 * <ma-events-table event-type="'SYSTEM'" alarm-level="'URGENT'" acknowledged="'*'"
 * active-status="'active' date-filter="true" from="fromTime" to="toTime" limit="50" 
 * sort="'-alarmLevel'"></ma-events-table>
 *
 * <!-- Example For Restricting Events to those Related to a Data Point -->
 * <ma-events-table single-point="true" point-id="myPoint.id" limit="5" from="fromTime" to="toTime"></ma-events-table>
 */
eventsTable.$inject = ['Events', 'eventsEventManager', 'UserNotes', '$mdMedia', '$injector', '$sce', 'mangoDateFormats'];
function eventsTable(Events, eventsEventManager, UserNotes, $mdMedia, $injector, $sce, mangoDateFormats) {
    return {
        restrict: 'E',
        scope: {
            pointId: '=?',
            singlePoint: '@',
            eventId: '=?',
            alarmLevel: '=?',
            eventType:'=?',
            acknowledged: '=?',
            activeStatus: '=?',
            limit: '=?',
            sort: '=?',
            from: '=?',
            to: '=?',
            dateFilter: '=?',
            timezone: '@'
        },
        templateUrl: require.toUrl('./eventsTable.html'),
        link: function ($scope, $element, attrs) {
            
            $scope.$mdMedia = $mdMedia;
            $scope.addNote = UserNotes.addNote;
            
            $scope.page = 1;
            $scope.total = 0;
            $scope.totalUnAcknowledged = 0;
            
            $scope.onPaginate = function(page, limit) {
                $scope.start = (page - 1) * limit;
            };
            
            $scope.parseHTML = function(text) {
                return $sce.trustAsHtml(text);
            };
            
            $scope.formatDate = function formatDate(date) {
                var m = moment(date);
                if ($scope.timezone) {
                    m.tz($scope.timezone);
                }
                return m.format(mangoDateFormats.shortDateTimeSeconds);
            };
            
            // Acknowledge single event
            $scope.acknowledgeEvents = function(events) {
                events.forEach(function(event) {
                    Events.acknowledge({id: event.id}, null).$promise.then(
                        function (data) {
                            // console.log('Success', data);
                            
                            if (data.id) {
                                $scope.events.some(function(item) {
                                    if (item.id === data.id) {
                                        return (item.acknowledged = true);
                                    }
                                });
                            }
                        },
                        function (data) {
                            console.log('Error', data);
                        }
                    );
                });
            };
            
            // Acknowledge all matching RQL with button
            $scope.acknowledgeAll = function() {
                Events.acknowledgeViaRql({rql: $scope.RQL.RQLforAcknowldege}, null).$promise.then(
                    function (data) {
                        if (data.count) {
                            //console.log('Acknowledged ', data.count, ' events with RQL', $scope.RQL.RQLforAcknowldege);
                            // Filter by acknowledged
                            $scope.acknowledged = 'true';
                        }
                    },
                    function (data) {
                        console.log('Error', data);
                    }
                );
            };
            
            // Watch events.$total to return a clean $scope.total that isn't ever undefined
            // Also query with limit(0) with RQLforAcknowldege to get a count of unacknowledged events to display on acknowledgeAll button
            $scope.$watch('events.$total', function(newValue, oldValue) {
                if (newValue === undefined || newValue === oldValue) return;
                $scope.total = newValue;
                
                if ($scope.acknowledged === 'false' || $scope.acknowledged === '*' || $scope.acknowledged === undefined) {
                    Events.rql({query: $scope.RQL.RQLforAcknowldege+'&limit(0)'}, null).$promise.then(
                        function (data) {
                            // console.log($scope.RQL.RQLforAcknowldege+'&limit(0)', data.$total);
                            $scope.totalUnAcknowledged = data.$total;
                        },
                        function (data) {
                            console.log('Error', data);
                        }
                    );
                }
                else {
                    $scope.totalUnAcknowledged = 0;
                }
            });
            
            // Watch for changes to controls on directive to update query
            // Contains logic for building the RWL string in doQuery
            $scope.$watch(function() {
                return {
                    eventType: $scope.eventType,
                    start: $scope.start,
                    limit: $scope.limit,
                    sort: $scope.sort,
                    alarmLevel: $scope.alarmLevel,
                    acknowledged: $scope.acknowledged,
                    activeStatus: $scope.activeStatus,
                    pointId: $scope.pointId,
                    eventId: $scope.eventId,
                    from: $scope.from,
                    to: $scope.to,
                    dateFilter: $scope.dateFilter
                };
            }, function(value) {
                
                // Return if singlePoint and pointId doesn't exist yet
                if ($scope.singlePoint && !$scope.pointId) {
                    // console.log('Returning', $scope.singlePoint, $scope.pointId);
                    return;
                }
                
                $scope.RQL = doQuery(value);
                //console.log('Querying on:', $scope.RQL.RQLforDisplay);
                $scope.events = Events.rql({query: $scope.RQL.RQLforDisplay});
            }, true);
            
            var doQuery = function(options) {
                var params = [];
                
                if (options.alarmLevel && options.alarmLevel != '*') {
                    params.push('alarmLevel=' + options.alarmLevel);
                }
                if (options.eventType && options.eventType != '*') {
                    params.push('eventType=' + options.eventType);
                }
                if (options.pointId) {
                    params.push('dataPointId=' + options.pointId);
                }
                if (options.eventId) {
                    params.push('id=' + options.eventId);
                }
                if (options.activeStatus && options.activeStatus != '*') {
                    if (options.activeStatus==='active') {
                        params.push('active=true');
                    }
                    else if (options.activeStatus==='noRtn') {
                        params.push('rtnApplicable=false');
                    }
                    else if (options.activeStatus==='normal') {
                        params.push('active=false');
                    }
                }
                if (options.acknowledged && options.acknowledged != '*') {
                    if (options.acknowledged==='true') {
                        params.push('acknowledged=true');
                    }
                    else if (options.acknowledged==='false') {
                        params.push('acknowledged=false');
                    }
                }
                if (options.from && options.dateFilter) {
                    params.push('activeTimestamp=ge=' + options.from.valueOf());
                }
                if (options.to && options.dateFilter) {
                    params.push('activeTimestamp=lt=' + options.to.valueOf());
                }
                
                var RQLforAcknowldege = params.join('&');
                var RQLforDisplay = params.join('&');
                
                
                if (options.acknowledged != 'false') {
                    RQLforAcknowldege += '&acknowledged=false';
                }
                
                if (options.sort) {
                    var sort = options.sort;
                    if (angular.isArray(sort)) {
                        sort = sort.join(',');
                    }
                    RQLforDisplay += '&sort(' + sort + ')';
                }
                if (options.limit) {
                    var start = options.start || 0;
                    RQLforDisplay += '&limit(' + options.limit + ',' + start + ')';
                }

                return {RQLforAcknowldege: RQLforAcknowldege, RQLforDisplay: RQLforDisplay}; 
            };
            
        }
    };
}

return eventsTable;

}); // define
