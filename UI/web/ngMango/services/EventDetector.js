/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';

eventDetectorFactory.$inject = ['maRestResource'];
function eventDetectorFactory(RestResource) {
    
    const eventDetectorBaseUrl = '/rest/v2/event-detectors';
    const eventDetectorWebSocketUrl = '/rest/v1/websocket/event-detectors';
    const eventDetectorXidPrefix = 'ED_';
    
	const defaultProperties = {
	};

    class EventDetector extends RestResource {
        static get defaultProperties() {
            return defaultProperties;
        }
        
        static get baseUrl() {
            return eventDetectorBaseUrl;
        }
        
        static get webSocketUrl() {
            return eventDetectorWebSocketUrl;
        }
        
        static get xidPrefix() {
            return eventDetectorXidPrefix;
        }
    }
    
    return EventDetector;
}

return eventDetectorFactory;

}); // define
