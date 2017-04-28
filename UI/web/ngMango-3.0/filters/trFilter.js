/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define([], function() {
'use strict';
/**
 * @ngdoc filter
 * @name ngMangoFilters.tr
 *
 * @description
 * Outputs the translation text for the set language.
 * - Inputs the translation key as a string
 * - Translations are written in `web/modules/mangoUI/classes/i18n.properties` file
 * - Example:
 *      - <code ng-non-bindable>{{'common.value' | maTr}}</code>
 *
 */
/*
 * The translate filter cannot asynchronously load the translation namespace and display the translation.
 * Translation namespace must be loaded into Globalize prior to filter being run.
 */
function trFilterFactory(Translate) {
    return function trFilter(key) {
        var args;
        if (angular.isArray(key)) {
            args = Array.prototype.slice.call(key, 1);
            key = key[0];
        } else {
            args = Array.prototype.slice.call(arguments, 1);
        }
    	var text;
    	try {
        	text = Translate.trSync(key, args);
    	} catch (e) {
    		text = '!!' + key + '!!';
    	}
    	return text;
    };
}

trFilterFactory.$inject = ['maTranslate'];
return trFilterFactory;

}); // define
