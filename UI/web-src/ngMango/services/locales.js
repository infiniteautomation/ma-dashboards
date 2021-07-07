/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import localeList from 'localeList';

LocalesFactory.$inject = ['$q'];
function LocalesFactory($q) {
    function Locales() {
    }

    Locales.prototype.get = function() {
        const sortedLocales = localeList.slice().sort((a, b) => {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
        });
        
        return $q.resolve(sortedLocales);
    };

    return new Locales();
}

export default LocalesFactory;
