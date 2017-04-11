/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['./services/errorInterceptor',
        './services/rQ',
        'angular'
], function(errorInterceptor, rQ, angular) {
'use strict';

var maAppComponents = angular.module('maAppComponents', []);

maAppComponents.provider('errorInterceptor', errorInterceptor);
maAppComponents.factory('rQ', rQ);
maAppComponents.constant('require', require);

return maAppComponents;

}); // require
