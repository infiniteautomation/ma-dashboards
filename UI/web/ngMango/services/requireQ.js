/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */




/**
* @ngdoc service
* @name ngMangoServices.maRequireQ
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
        deps: ['maRequireQ', '$injector', function(maRequireQ, $injector) {
            return maRequireQ(['./directives/login/login'], function(login) {
                angular.module('login', [])
                    .directive('login', login);
                $injector.loadNewModules(['login']);
            });
        }],
        loginTranslations: ['maTranslate', function(Translate) {
            return Translate.loadNamespaces('login');
        }]
    }
}
* </pre>
*/

RequireQProvider.$inject = [];
function RequireQProvider() {
    var providerRequire = requirejs;
    
    this.setRequireJs = function(requireJs) {
        providerRequire = requireJs;
    };
    
    this.$get = requireQFactory;

    requireQFactory.$inject = ['$q'];
    function requireQFactory($q) {
        function requireQ(deps, success, fail, fail2) {
            var localRequire = providerRequire;
            if (typeof deps === 'function') {
                localRequire = deps;
                deps = success;
                success = fail;
                fail = fail2;
            }
            
            var defer = $q.defer();
            localRequire(deps, function() {
                var result = typeof success === 'function' ? success.apply(null, arguments) : success;
                defer.resolve(result);
            }, function() {
                var result = typeof fail === 'function' ? fail.apply(null, arguments) : fail;
                defer.reject(result);
            });
            return defer.promise;
        }

        return requireQ;
    }
}

export default RequireQProvider;


