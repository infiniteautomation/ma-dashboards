/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */



/**
* @ngdoc service
* @name ngMangoServices.maWatchListEventManager
*
* @description
* Provides an <a ui-sref="ui.docs.ngMangoServices.EventManager">EventManager</a> factory pointing to the point-value
* websocket endpoint at `'/rest/v2/websocket/watch-list'`
* - All methods available to <a ui-sref="ui.docs.ngMangoServices.EventManager">EventManager</a> are available.
*
* # Usage
*
* <pre prettyprint-mode="javascript">
    watchListEventManager.subscribe(xid, SUBSCRIPTION_TYPES, websocketHandler);
* </pre>
*/

WatchListEventManagerFactory.$inject = ['maEventManager', 'maWatchList'];
function WatchListEventManagerFactory(EventManager, WatchList) {
    return new EventManager({
    	url: '/rest/v2/websocket/watch-lists',
    	transformPayload(payload) {
    	    if (payload.object) {
    	        payload.object = Object.assign(Object.create(WatchList.prototype), payload.object);
    	        if (payload.object.xid) {
    	            payload.object.originalId = payload.object.xid;
    	        }
    	    }
    	    return payload;
    	}
    });
}

export default WatchListEventManagerFactory;