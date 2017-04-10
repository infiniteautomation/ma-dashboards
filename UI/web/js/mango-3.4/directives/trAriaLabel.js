/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['jquery', 'angular'], function($, angular) {
'use strict';
/**
 * @ngdoc directive
 * @name maDashboards.maTrAriaLabelAriaLabel
 * @restrict A
 * @description
 * `<button ma-tr-aria-label="ui.dox.input"></button>`
 * - Sets the aria-label attribute for an element to the translation set for the current language
 * - Translations are written in `web/modules/ui/classes/i18n.properties` file
 *
 * @usage
 * <button ma-tr-aria-label="ui.dox.input"></button>
 */
function maTrAriaLabel(Translate) {
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
	            	return $.Deferred().resolve(result);
	            }).then(function(result) {
                    $attrs.$set('aria-label', result.text);
	            });
            }
        }
    };
}

maTrAriaLabel.$inject = ['Translate'];
return maTrAriaLabel;

}); // define
