/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([], function() {
'use strict';
/**
* @ngdoc service
* @name maServices.PointEventManager
*
* @description
* Provides an <a ui-sref="dashboard.docs.maServices.EventManager">EventManager</a> factory pointing to the point-value websocket endpoint at `'/rest/v1/websocket/point-value'`
* - All methods available to <a ui-sref="dashboard.docs.maServices.EventManager">EventManager</a> are available.
* - Used by <a ui-sref="dashboard.docs.maDashboards.maGetPointValue">`<ma-get-point-value>`</a> directive.
*
* # Usage
*
* <pre prettyprint-mode="javascript">
    pointEventManager.subscribe(newXid, SUBSCRIPTION_TYPES, websocketHandler);
* </pre>
*/
function PointEventManagerFactory(EventManager) {
    return new EventManager({
    	url: '/rest/v1/websocket/point-value',
    	replayLastPayload: true
    });
}

PointEventManagerFactory.$inject = ['EventManager'];
return PointEventManagerFactory;

}); // define
