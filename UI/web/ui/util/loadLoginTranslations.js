/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['moment-timezone'], function(moment) {
'use strict';

loadLoginTranslations.$inject = ['maTranslate'];
function loadLoginTranslations(Translate) {
    return Translate.loadNamespaces('login');
}

return loadLoginTranslations;

});
