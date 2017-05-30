/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['./services/errorInterceptor',
        './services/rQ',
        'angular'
], function(errorInterceptor, rQ, angular) {
'use strict';

var ngMangoComponents = angular.module('ngMangoComponents', []);

ngMangoComponents.provider('errorInterceptor', errorInterceptor);
ngMangoComponents.factory('rQ', rQ);
ngMangoComponents.constant('require', require);

return ngMangoComponents;

}); // require
