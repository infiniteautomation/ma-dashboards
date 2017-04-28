/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([], function() {
'use strict';
/**
* @ngdoc service
* @name ngMangoServices.JsonStoreEventManager
*
* @description
* Provides an <a ui-sref="ui.docs.ngMangoServices.EventManager">EventManager</a> factory pointing to the json-data websocket endpoint at `'/rest/v1/websocket/json-data'`
* - All methods available to <a ui-sref="ui.docs.ngMangoServices.EventManager">EventManager</a> are available.
* - Used by <a ui-sref="ui.docs.ngMango.maJsonStore">`<ma-json-store>`</a> directive.
*
* # Usage
*
* <pre prettyprint-mode="javascript">
    jsonStoreEventManager.unsubscribe($scope.item.xid, SUBSCRIPTION_TYPES, websocketHandler);
* </pre>
*/

function JsonStoreEventManagerFactory(EventManager) {
    return new EventManager({
    	url: '/rest/v1/websocket/json-data'
    });
}

JsonStoreEventManagerFactory.$inject = ['maEventManager'];
return JsonStoreEventManagerFactory;

}); // define
