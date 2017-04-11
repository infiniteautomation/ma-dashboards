/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([], function() {
'use strict';

function JsonStoreEventManagerFactory(EventManager) {
    return new EventManager({
    	url: '/rest/v1/websocket/json-data'
    });
}

JsonStoreEventManagerFactory.$inject = ['EventManager'];
return JsonStoreEventManagerFactory;

}); // define
