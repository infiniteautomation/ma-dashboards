/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

/**
* @ngdoc service
* @name ngMangoServices.maEvents
*
* @description
* Provides a service for retrieving, adding, and acknowledging events/alarms
* - Used by <a ui-sref="ui.docs.ngMango.maEventsTable">`<ma-events-table>`</a> 
*
*
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maEvents
* @name Events#get
*
* @description
* A default action provided by $resource. Makes a http GET call to the rest endpoint `/rest/v1/events`
* @returns {array} Returns an Array of event objects matching the query. Objects will be of the resource class and have resource actions available to them.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maEvents
* @name Events#save
*
* @description
* A default action provided by $resource. Makes a http POST call to the rest endpoint `/rest/v1/events`
* @returns {array} Returns an Array of event objects matching the query. Objects will be of the resource class and have resource actions available to them.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maEvents
* @name Events#remove
*
* @description
* A default action provided by $resource. Makes a http DELETE call to the rest endpoint `/rest/v1/events`
* @returns {array} Returns an Array of event objects matching the query. Objects will be of the resource class and have resource actions available to them.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maEvents
* @name Events#delete
*
* @description
* A default action provided by $resource. Makes a http DELETE call to the rest endpoint `/rest/v1/events`
* @param {object} query Object for the query, can have a `contains` property for querying events that contain the given string.
* @returns {array} Returns an Array of event objects matching the query. Objects will be of the resource class and have resource actions available to them.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maEvents
* @name Events#query
*
* @description
* A default action provided by $resource. Makes a http GET call to the rest endpoint `/rest/v1/events`
* @param {object} query Object for the query, can have a `contains` property for querying events that contain the given string.
* @returns {array} Returns an Array of event objects matching the query. Objects will be of the resource class and have resource actions available to them.
*
*/


/**
* @ngdoc method
* @methodOf ngMangoServices.maEvents
* @name Events#objQuery
*
* @description
* Can be passed an object with an rql string or object with values to build query
* @param {object} query Object for the query, can have a `query` property set to an RQL string or set to an object with keys and values.
* @returns {array} Returns an Array of event objects matching the query. Objects will be of the resource class and have resource actions available to them.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maEvents
* @name Events#getActiveSummary
*
* @description
* Returns a list of counts for all active events by type and the most recent active alarm for each.

* @returns {array} Returns an Array of counts for all active events by type and the most recent active alarm for each.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maEvents
* @name Events#acknowledge
*
* @description
* Acknowledges a single event by passing in an event id.
* @param {object} id Passed in an object with an id property cooresponding to the event id.
* @returns {object} Returns an event object with an id property if successful.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maEvents
* @name Events#acknowledgeViaRql
*
* @description
* Acknowledge many events using an RQL string as a parameter
* @param {object} rql Object with an rql string property equal to the rql used to find all the events that you wish to acknowledge.
* @returns {object} Returns an object with a count property equal to the number of events acknowledged.
*
*/

eventsFactory.$inject = ['$resource', 'maUtil'];
function eventsFactory($resource, Util) {
    const Events = $resource('/rest/v1/events', {
        id: '@id'
    }, {
        query: {
            method: 'GET',
            isArray: true,
            transformResponse: Util.transformArrayResponse,
            interceptor: {
                response: Util.arrayResponseInterceptor
            },
            cancellable: true
        },
        acknowledge: {
            method: 'PUT',
            url: '/rest/v1/events/acknowledge/:id',
            transformRequest: (data, headersGetter) => {
                return null;
            }
        },
        acknowledgeViaRql: {
            method: 'POST',
            url: '/rest/v1/events/acknowledge'
        },
        getActiveSummary: {
        	url: '/rest/v1/events/active-summary',
            method: 'GET',
            isArray: true
        }
    }, {
        cancellable: true
    });

    Object.defineProperty(Events.prototype, 'duration', {
        get: function() {
            if (this.returnToNormalTimestamp === 0) {
                if (!this.active) return null;
                
                // round to prevent infinite digests
                const time = Math.floor(new Date().valueOf() / 1000) * 1000;
                return time - this.activeTimestamp;
            } else {
                return this.returnToNormalTimestamp - this.activeTimestamp;
            }
        }
    });

    const subscriptionMessage = {
        eventTypes: ['RAISED', 'ACKNOWLEDGED', 'RETURN_TO_NORMAL', 'DEACTIVATED'],
        levels: ['LIFE_SAFETY', 'CRITICAL', 'URGENT', 'WARNING', 'IMPORTANT', 'INFORMATION', 'NONE']
    };
    
    Object.assign(Events.notificationManager, {
        webSocketUrl: '/rest/v1/websocket/events',
        onOpen() {
            this.sendMessage(subscriptionMessage);
        },
        notifyFromPayload(payload) {
            if (payload.type && payload.event) {
                const item = new Events(payload.event);
                this.notify(payload.type, item);
            }
        }
    });
    
    Object.assign(Events, {
        levels: Object.freeze([
            {key: 'NONE', classes: 'fa-flag ma-alarm-level-none', translation: 'common.alarmLevel.none'},
            {key: 'INFORMATION', classes: 'fa-flag ma-alarm-level-information', translation: 'common.alarmLevel.info'},
            {key: 'IMPORTANT', classes: 'fa-flag ma-alarm-level-important', translation: 'common.alarmLevel.important'},
            {key: 'WARNING', classes: 'fa-flag ma-alarm-level-warning', translation: 'common.alarmLevel.warning'},
            {key: 'URGENT', classes: 'fa-flag ma-alarm-level-urgent', translation: 'common.alarmLevel.urgent'},
            {key: 'CRITICAL', classes: 'fa-flag ma-alarm-level-critical', translation: 'common.alarmLevel.critical'},
            {key: 'LIFE_SAFETY', classes: 'fa-flag ma-alarm-level-life', translation: 'common.alarmLevel.lifeSafety'},
            {key: 'DO_NOT_LOG', classes: 'fa-times-circle ma-alarm-level-do', translation: 'common.alarmLevel.doNotLog'},
            {key: 'IGNORE', classes: 'fa-times ma-alarm-level-ignore', translation: 'common.alarmLevel.ignore'}
        ])
    });

    return Events;
}

export default eventsFactory;

