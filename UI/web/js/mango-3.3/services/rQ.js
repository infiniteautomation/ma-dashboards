/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([], function() {
'use strict';
/**
* @ngdoc service
* @name maServices.rQ
*
* @description
* The `rQ` service provides asynchronous loading of components via requireJS.
*
* # Example Usage in Login State Definition
*
* <pre prettyprint-mode="javascript">

    name: 'login',
    url: '/login',
    templateUrl: 'views/login.html',
    menuHidden: true,
    menuIcon: 'fa-sign-in',
    menuTr: 'header.login',
    resolve: {
        deps: ['rQ', '$ocLazyLoad', function(rQ, $ocLazyLoad) {
            return rQ(['./directives/login/login'], function(login) {
                angular.module('login', [])
                    .directive('login', login);
                $ocLazyLoad.inject('login');
            });
        }],
        loginTranslations: ['Translate', function(Translate) {
            return Translate.loadNamespaces('login');
        }]
    }
}
* </pre>
*/

function rqFactory($q, require) {
    function rQ(deps, success, fail) {
        var defer = $q.defer();
        require(deps, function() {
            var result = typeof success === 'function' ? success.apply(null, arguments) : success;
            defer.resolve(result);
        }, function() {
            var result = typeof fail === 'function' ? fail.apply(null, arguments) : fail;
            defer.reject(result);
        });
        return defer.promise;
    }

	return rQ;
}

rqFactory.$inject = ['$q', 'require'];

return rqFactory;

}); // define
