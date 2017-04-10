/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([], function() {
'use strict';

function PointEventManagerFactory(EventManager) {
    return new EventManager({
    	url: '/rest/v1/websocket/point-value'
    });
}

PointEventManagerFactory.$inject = ['EventManager'];
return PointEventManagerFactory;

}); // define
