/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';
/**
 * @ngdoc directive
 * @name ngMango.directive:maTrAriaLabel
 * @restrict A
 * @description
 * `<button ma-tr-aria-label="ui.dox.input"></button>`
 * - Sets the aria-label attribute for an element to the translation set for the current language
 * - Translations are written in `web/modules/mangoUI/classes/i18n.properties` file
 *
 * @usage
 * <button ma-tr-aria-label="ui.dox.input"></button>
 */
maTrAriaLabel.$inject = ['maTranslate', '$q'];
function maTrAriaLabel(Translate, $q) {
    return {
        restrict: 'A',
        scope: false,
        link: function ($scope, $elem, $attrs) {
            var trKey, trArgs;

            $attrs.$observe('maTrAriaLabel', function(newValue) {
        	    doTranslate(newValue, trArgs);
        	});
            $scope.$watchCollection($attrs.maTrAriaLabelArgs, function(newValue, oldValue) {
                doTranslate(trKey, newValue);
            });

            function doTranslate(newKey, newArgs) {
                if (newKey === trKey && angular.equals(newArgs, trArgs)) {
                    return;
                }
                trKey = newKey;
                trArgs = newArgs;
                if (!trKey) return;
                // dont attempt translation if args attribute exists but trArgs is currently undefined
                // or any element in trArgs is undefined, prevents flicking from an error message to the real
                // translation once the arguments load
                if (typeof $attrs.maTrAriaLabelArgs !== 'undefined') {
                	if (!angular.isArray(trArgs)) return;
                	var containsUndefined = trArgs.some(function(arg) {
                		return typeof arg === 'undefined';
                	});
                	if (containsUndefined) return;
                }
                
	            Translate.tr(trKey, trArgs || []).then(function(translation) {
	            	return {
	            		failed: false,
	            		text: translation
	            	};
	            }, function(error) {
	            	var result = {
	            		failed: true,
	            		text: '!!' + $attrs.maTrAriaLabel + '!!'
	            	};
	            	return $q.resolve(result);
	            }).then(function(result) {
                    $attrs.$set('aria-label', result.text);
	            });
            }
        }
    };
}

return maTrAriaLabel;

}); // define
