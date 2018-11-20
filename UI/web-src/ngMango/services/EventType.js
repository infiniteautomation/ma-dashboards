/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

eventTypeFactory.$inject = ['$http'];
function eventTypeFactory($http) {

    const eventTypeBaseUrl = '/rest/v2/event-types';
    
    class EventType {
        static list() {
            return $http({
                method: 'GET',
                url: eventTypeBaseUrl,
            }).then(response => response.data);
        }
        
        static typeNames() {
            return $http({
                method: 'GET',
                url: `${eventTypeBaseUrl}/type-names`
            }).then(response => response.data);
        }
    }
    
    return EventType;
}

export default eventTypeFactory;