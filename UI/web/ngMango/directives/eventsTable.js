/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require', 'rql/query', 'moment-timezone'], function(angular, require, query, moment) {
'use strict';
/**
 * @ngdoc directive
 * @name ngMango.directive:maEventsTable
 * @restrict E
 * @description
 * `<ma-events-table></ma-events-table>`
 * - Displays a list of Events in a table format.
 * - Allows for filtering of events by several attributes as explained below.
 * - Can be set to query for events within a specific date range.
 * - The table includes the ability to filter and sort by alarm level and timestamp.
 * - Events can be acknowledged one at a time or a button is shown to acknowledge all events matching the query.
 * - Note in usage examples below raw string literals are wrapped in single quotes where as variable names / numbers / booleans are not.
 * - <a ui-sref="ui.examples.utilities.eventsTable">View Demo</a>
 *
 * @param {number} limit Set the initial limit of the pagination.
 * @param {string=} point-id Filter on the Id property of a point, use with `"single-point=true"`.
 * @param {boolean=} single-point Set to `"true"` and use with point-id attribute to return events related to just a single Data Point.
 * @param {number=} event-id Filter on a specific Event Id, should return a single event.
 * @param {string=} alarm-level Filter on Alarm Level. Possible values are:
 *     `"'NONE'"`, `"'INFORMATION'"`, `"'IMPORTANT'"`, `"'WARNING'"`, `"'URGENT'"`, `"'CRITICAL'"`, `"'LIFE_SAFETY'"` or `"'*'"` for any.
 * @param {string=} event-type Filter on Event Type. Possible values are: `"'DATA_POINT'"`, `"'DATA_SOURCE'"`, `"'SYSTEM'"` or `"'*'"` for any.
 * @param {string=} acknowledged Filter on whether the event has been acknowledged. Possible values are: `"'true'"`, `"'false'"` or `"'*'"` for either.
 * @param {string=} active-status Filter on Active Status. Possible values are: `"'active'"`, `"'noRtn'"`, `"'normal'"` or `"'*'"` for any.
 * @param {string=} sort Set the initial sorting column of the table. Possible values are:
 *     `"'alarmLevel'"`, `"'activeTimestamp'"`, `"'message'"` or `"'acknowledged'"`.
 *     Precede value with a negative (eg. `"'-activeTimestamp'"`) to reverse sorting.
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

eventsTable.$inject = ['maEvents', 'maUserNotes', '$mdMedia', '$injector', '$sce', 'MA_DATE_FORMATS'];
function eventsTable(Events, UserNotes, $mdMedia, $injector, $sce, mangoDateFormats) {

    const $inject = Object.freeze(['$scope']);
    class EventsTableController {
        static get $inject() { return $inject; }
        
        constructor($scope) {
            this.$scope = $scope;
            
            this.$mdMedia = $mdMedia;
            this.page = 1;
            this.total = 0;
            this.totalUnAcknowledged = 0;
            
            this.onPaginateBound = (...args) => this.onPaginate(...args);
            this.onReorderBound = (...args) => this.onReorder(...args);
        }

        $onInit() {
            Events.notificationManager.subscribe((event, mangoEvent) => {
                console.log(event.name, mangoEvent);
                
                const index = this.events.findIndex((item) => {
                    return item.id === mangoEvent.id;
                });
                
                if (index >= 0) {
                    this.events[index] = mangoEvent;
                }
                
                if (event.name === 'RAISED' && this.sort === '-activeTimestamp') {
                    
                }
                
            }, this.$scope, ['RAISED', 'ACKNOWLEDGED', 'RETURN_TO_NORMAL', 'DEACTIVATED']);

            // Watch events.$total to return a clean this.total that isn't ever undefined
            this.$scope.$watch('$ctrl.events.$total', (newValue, oldValue) => {
                if (newValue === undefined || newValue === oldValue) return;
                this.total = newValue;
                

            });
        }
        
        $onChanges(changes) {
            this.doQuery();
        }
        
        doQuery() {
            // Return if singlePoint and pointId doesn't exist yet
            if (this.singlePoint && !this.pointId) {
                return;
            }

            this.RQL = Events.getRQL({
                eventType: this.eventType,
                start: this.start,
                limit: this.limit,
                sort: this.sort,
                alarmLevel: this.alarmLevel,
                acknowledged: this.acknowledged,
                activeStatus: this.activeStatus,
                pointId: this.pointId,
                eventId: this.eventId,
                from: this.from,
                to: this.to,
                dateFilter: this.dateFilter
            });
            
            // cancel the previous request if its ongoing
            if (this.queryResource) {
                this.queryResource.$cancelRequest();
            }
            
            this.queryResource = Events.rql({query: this.RQL.RQLforDisplay});
            this.tableQueryPromise = this.queryResource.$promise.then((data) => {
                // Set Events For Table
                this.events = data;
                this.total = this.events.$total;
                this.countUnacknowledged();

                // Query for Notes for each
                this.events.forEach((event) => {
                    UserNotes.query({
                        commentType: 'Event',
                        referenceId: event.id
                    }).$promise.then((notes) => {
                        if (notes.length) {
                            event.hasNotes = true;
                        }
                        
                        notes.forEach((note, index) => {
                            event.message += '<br> <strong>' + note.comment + '</strong> (' + note.username + ' - ' +
                                this.formatDate(note.timestamp)+ ')';
                        });
                    });
                });
            });
        }

        /**
         *  Also query with limit(0) with RQLforAcknowldege to get a count of unacknowledged events to display on acknowledgeAll button
         */
        countUnacknowledged() {
            // cancel the previous request if its ongoing
            if (this.countUnacknowledgedResource) {
                this.countUnacknowledgedResource.$cancelRequest();
            }
            
            if (this.acknowledged === 'false' || this.acknowledged === '*' || this.acknowledged === undefined) {
                this.countUnacknowledgedResource = Events.rql({query: this.RQL.RQLforAcknowldege+'&limit(0)'}, null);
                this.countUnacknowledgedResource.$promise.then((data) => {
                    this.totalUnAcknowledged = data.$total;
                });
            } else {
                this.totalUnAcknowledged = 0;
            }
        }
        
        addNote($event, event) {
            const callback = (note, event) => {
                event.hasNotes = true;
                event.message += '<br> <strong>' + note.comment + '</strong> (' + note.username + ' - ' +
                    this.formatDate(note.timestamp)+ ')';
            };
            
            UserNotes.addNote($event, 'Event', event.id, callback , event);
        }

        onPaginate(page, limit) {
            this.start = (page - 1) * limit;
            this.doQuery();
        }
        
        onReorder() {
            this.doQuery();
        }
        
        parseHTML(text) {
            return $sce.trustAsHtml(text);
        }
        
        formatDate(date) {
            var m = moment(date);
            if (this.timezone) {
                m.tz(this.timezone);
            }
            return m.format(mangoDateFormats.shortDateTimeSeconds);
        }
        
        // Acknowledge single event
        acknowledgeEvent(event) {
            event.$acknowledge().then(() => {
                event.acknowledged = true;
                this.totalUnAcknowledged--;
            });
        }
        
        // Acknowledge multiple events
        acknowledgeEvents(events) {
            events.forEach((event) => {
                this.acknowledgeEvent(event);
            });
        }
        
        // Acknowledge all matching RQL with button
        acknowledgeAll() {
            Events.acknowledgeViaRql({rql: this.RQL.RQLforAcknowldege}, null).$promise.then((data) => {
                if (data.count) {
                    // re-query
                    this.doQuery();
                }
            });
        }
    }
    
    return {
        restrict: 'E',
        templateUrl: require.toUrl('./eventsTable.html'),
        scope: {},
        controller: EventsTableController,
        controllerAs: '$ctrl',
        bindToController: {
            pointId: '<?',
            singlePoint: '@',
            eventId: '<?',
            alarmLevel: '<?',
            eventType:'<?',
            acknowledged: '<?',
            activeStatus: '<?',
            limit: '<?',
            sort: '<?',
            from: '<?',
            to: '<?',
            dateFilter: '<?',
            timezone: '@',
            hideDataPointLink: '<?'
        },
        designerInfo: {
            translation: 'ui.app.eventsTable',
            icon: 'alarm'
        }
    };
}

return eventsTable;

}); // define
