/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

/**
 * @ngdoc filter
 * @name ngMangoFilters.filter:maTr
 * @function
 * @param {string} translationKey The translation key
 * @param {string} arg1 Translation argument 1
 * @param {string} arg2 Translation argument 2
 * @param {string} arg3 Translation argument 3
 *
 * @description
 * Outputs the translation text for the set language.
 * - Inputs the translation key as a string
 * - Translations are written in `web/modules/mangoUI/classes/i18n.properties` file
 * - Arguments are inserted in the string wherever {0}, {1}, {3} ... occurs
 */
/*
 * The translate filter cannot asynchronously load the translation namespace and display the translation.
 * Translation namespace must be loaded into Globalize prior to filter being run.
 */
function trFilterFactory(Translate) {
    return function trFilter(key, args) {
        if (Array.isArray(key)) {
            args = key.slice(1);
            key = key[0];
        } else if (args != null && !Array.isArray(args)) {
            console.warn('Deprecated use of maTranslate.trSync()');
            args = Array.prototype.slice.call(arguments, 1);
        }

        let text;
        try {
            text = Translate.trSync(key, args);
        } catch (e) {
            text = '!!' + key + '!!';
        }
        return text;
    };
}

trFilterFactory.$inject = ['maTranslate'];
export default trFilterFactory;


