/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

/**
 * @ngdoc directive
 * @name ngMango.directive:maTr
 * @restrict A
 * @description
 * `<span ma-tr="ui.dox.input"></span>`
 * - Sets the text within an element to the translation set for the current language
 * - Translations are written in `web/modules/mangoUI/classes/i18n.properties` file
 *
 * @usage
 * <span ma-tr="ui.dox.input"></span>
 */
maTr.$inject = ['maTranslate', '$q'];
function maTr(Translate, $q) {
    return {
        restrict: 'A',
        scope: false,
        link: function ($scope, $elem, $attrs) {
            let trKey, trArgs, trPromise;

            $scope.$watch(function() {
                return {
                    key: $attrs.maTr,
                    args: $scope.$eval($attrs.maTrArgs)
                };
            }, function(newValue) {
                doTranslate(newValue.key, newValue.args);
            }, true);

            function doTranslate(newKey, newArgs) {
                trKey = newKey;
                trArgs = newArgs;
                if (!trKey) return;
            	// dont attempt translation if args attribute exists but trArgs is currently undefined
                // or any element in trArgs is undefined, prevents flicking from an error message to the real
                // translation once the arguments load
                if (typeof $attrs.maTrArgs !== 'undefined') {
                	if (!Array.isArray(trArgs)) return;
                	const containsUndefined = trArgs.some(function(arg) {
                		return typeof arg === 'undefined';
                	});
                	if (containsUndefined) return;
                }

                trPromise = Translate.tr(trKey, trArgs || []).then(function(translation) {
	            	return {
	            		failed: false,
	            		text: translation
	            	};
	            }, function(error) {
            		return $q.resolve({
            			failed: true,
            			text: '!!' + $attrs.maTr + '!!'
            		});
	            }).then(function(result) {
	            	const text = result.text;
	            	const tagName = $elem.prop('tagName');
	            	if (tagName === 'IMG') {
                        $attrs.$set('alt', text);
	            		return;
	            	} else if (tagName === 'INPUT') {
                        $attrs.$set('placeholder', text);
	            		return;
	            	} else if (tagName === 'BUTTON' || $elem.hasClass('md-button')) {
	            	    $attrs.$set('aria-label', text);
	            	    // if button already has text contents, then only set the aria-label
	            	    if ($elem.contents().length) return;
	            	} else if (tagName === 'MDP-DATE-PICKER' || tagName === 'MDP-TIME-PICKER' ||
	            	        tagName === 'MD-INPUT-CONTAINER' || tagName === 'MA-FILTERING-POINT-LIST') {
	            	    $elem.find('label').text(text);
	            	    return;
	            	} else if (tagName === 'MD-SELECT') {
                        $attrs.$set('ariaLabel', text);
	            	    $attrs.$set('placeholder', text);
	            	    return;
	            	}

	            	const firstChild = $elem.contents().length && $elem.contents().get(0);
	            	// if first child is a text node set the text value
	                if (firstChild && firstChild.nodeType === 3) {
	                	firstChild.nodeValue = text;
	                } else {
	                	// else prepend a text node to its children
	                    $elem.prepend(document.createTextNode(text));
	                }
	            });
            }
        }
    };
}

export default maTr;


