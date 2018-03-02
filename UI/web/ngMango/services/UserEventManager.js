/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */



/**
* @ngdoc service
* @name ngMangoServices.maUserEventManager
*
* @description
* Provides an <a ui-sref="ui.docs.ngMangoServices.EventManager">EventManager</a> factory pointing to the websocket endpoint at `'/rest/v1/websocket/users'`
* - All methods available to <a ui-sref="ui.docs.ngMangoServices.EventManager">EventManager</a> are available.
*
* # Usage
*
* <pre prettyprint-mode="javascript">
    userEventManager.subscribe(xid, SUBSCRIPTION_TYPES, websocketHandler);
* </pre>
*/
UserEventManagerFactory.$inject = ['maEventManager'];
function UserEventManagerFactory(EventManager) {
    return new EventManager({
    	url: '/rest/v1/websocket/users'
    });
}

export default UserEventManagerFactory;


