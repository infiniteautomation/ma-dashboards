/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

/**
* @ngdoc service
* @name ngMangoServices.maJsonStoreEventManager
*
* @description
* Provides an <a ui-sref="ui.docs.ngMangoServices.EventManager">EventManager</a> factory pointing to the json-data websocket
* endpoint at `'/rest/v1/websocket/json-data'`
* - All methods available to <a ui-sref="ui.docs.ngMangoServices.EventManager">EventManager</a> are available.
* - Used by <a ui-sref="ui.docs.ngMango.maJsonStore">`<ma-json-store>`</a> directive.
*
* # Usage
*
* <pre prettyprint-mode="javascript">
    jsonStoreEventManager.unsubscribe($scope.item.xid, SUBSCRIPTION_TYPES, websocketHandler);
* </pre>
*/

JsonStoreEventManagerFactory.$inject = ['maEventManager', 'maJsonStore'];
function JsonStoreEventManagerFactory(EventManager, JsonStore) {
    return new EventManager({
    	url: '/rest/v1/websocket/json-data',
        transformPayload(payload) {
            if (payload.object) {
                payload.object = Object.assign(Object.create(JsonStore.prototype), payload.object);
                if (payload.object.xid) {
                    payload.object.originalId = payload.object.xid;
                }
            }
            return payload;
        }
    });
}

export default JsonStoreEventManagerFactory;