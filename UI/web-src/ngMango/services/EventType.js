/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

eventTypeFactory.$inject = ['maRestResource'];
function eventTypeFactory(RestResource) {

    const eventTypeBaseUrl = '/rest/v2/event-types';
    
    class EventType extends RestResource {
        static get baseUrl() {
            return eventTypeBaseUrl;
        }

        static typeNames(opts = {}) {
            return this.http({
                method: 'GET',
                url: `${eventTypeBaseUrl}/type-names`
            }, opts).then(response => response.data);
        }
        
        get uniqueId() {
            const type = this.type;
            return `${type.eventType}_${type.subType}_${type.referenceId1}_${type.referenceId2}`;
        }
    }
    
    return EventType;
}

export default eventTypeFactory;