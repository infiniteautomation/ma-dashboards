/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */



/**
* @ngdoc service
* @name ngMangoServices.maPointEventManager
*
* @description
* Provides an <a ui-sref="ui.docs.ngMangoServices.EventManager">EventManager</a> factory pointing to the point-value websocket
* endpoint at `'/rest/v2/websocket/point-value'`
* - All methods available to <a ui-sref="ui.docs.ngMangoServices.EventManager">EventManager</a> are available.
* - Used by <a ui-sref="ui.docs.ngMango.maGetPointValue">`<ma-get-point-value>`</a> directive.
*
* # Usage
*
* <pre prettyprint-mode="javascript">
    pointEventManager.subscribe(newXid, SUBSCRIPTION_TYPES, websocketHandler);
* </pre>
*/
function PointEventManagerFactory(EventManager) {
    return new EventManager({
    	url: '/rest/v2/websocket/point-value',
    	replayLastPayload: true
    });
}

PointEventManagerFactory.$inject = ['maEventManager'];
export default PointEventManagerFactory;