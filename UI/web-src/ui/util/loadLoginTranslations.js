/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

loadLoginTranslations.$inject = ['maTranslate', '$rootScope', '$q'];
function loadLoginTranslations(Translate, $rootScope, $q) {
    return Translate.loadNamespaces('login').then(result => {
        $rootScope.noApi = false;
        return result;
    }, error => {
        if (error.status === 404) {
            $rootScope.noApi = true;
        }
        return $q.reject(error);
    });
}

function loadTranslations(...args) {
    const resolveTranslations = function(maTranslate) {
        return maTranslate.loadNamespaces(...args);
    };
    resolveTranslations.$inject = ['maTranslate'];
    return resolveTranslations;
}

export {loadLoginTranslations as default, loadLoginTranslations, loadTranslations};
