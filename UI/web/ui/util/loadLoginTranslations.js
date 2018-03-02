/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import moment from 'moment-timezone';


loadLoginTranslations.$inject = ['maTranslate'];
function loadLoginTranslations(Translate) {
    return Translate.loadNamespaces('login');
}

export default loadLoginTranslations;


