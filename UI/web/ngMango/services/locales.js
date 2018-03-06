/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import localeList from 'localeList';

LocalesFactory.$inject = ['$q'];
function LocalesFactory($q) {
    function Locales() {
    }

    Locales.prototype.get = function() {
        const sortedLocales = localeList.splice().sort((a, b) => {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
        });
        
        return $q.resolve(sortedLocales);
    };

    return new Locales();
}

export default LocalesFactory;
