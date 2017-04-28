/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([], function() {
'use strict';

loadLoginTranslations.$inject = ['maTranslate', 'maUser', '$window'];
function loadLoginTranslations(Translate, User, $window) {
    return Translate.loadNamespaces('login').then(function(data) {
        var user = User.current;
        moment.locale((user && user.locale) || data.locale || $window.navigator.languages || $window.navigator.language);
        moment.tz.setDefault(user ? user.getTimezone() : moment.tz.guess());
    });
}

return loadLoginTranslations;

});
