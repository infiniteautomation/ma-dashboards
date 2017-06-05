/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([], function() {
'use strict';

ModulesWebSocketFactory.$inject = ['maWebSocketManager'];
function ModulesWebSocketFactory(WebSocketManager) {
	return new WebSocketManager({
		url: '/rest/v1/websocket/modules'
	});
}

return ModulesWebSocketFactory;

}); // define
