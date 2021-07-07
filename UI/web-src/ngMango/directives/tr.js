/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
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
maTr.$inject = ['maTranslate'];
function maTr(Translate) {
    return {
        restrict: 'A',
        scope: false,
        link: function($scope, $elem, $attrs) {
            $scope.$watch(() => {
                return {
                    key: $attrs.maTr,
                    args: $scope.$eval($attrs.maTrArgs)
                };
            }, newValue => {
                doTranslate(newValue.key, newValue.args);
            }, true);

            function doTranslate(trKey, trArgs) {
                if (!trKey) return;
                
                // dont attempt translation if args attribute exists but trArgs is currently undefined
                // or any element in trArgs is undefined, prevents flicking from an error message to the real
                // translation once the arguments load
                const hasArgsAttr = $attrs.hasOwnProperty('maTrArgs');
                const argsIsArray = Array.isArray(trArgs);
                if (argsIsArray && trArgs.some(arg => typeof arg === 'undefined')) {
                    return;
                }

                Translate.tr(trKey, trArgs || []).then(translation => {
                    return {
                        failed: false,
                        text: translation
                    };
                }, error => {
                    return {
                        failed: true,
                        text: '!!' + trKey + '!!'
                    };
                }).then(result => {
                    if (result.failed) {
                        if (hasArgsAttr && !argsIsArray) {
                            // assume failed due to args not being present yet
                            return;
                        } else {
                            console.warn('Missing translation', trKey);
                        }
                    }
                    
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
                        $elem.maFind('label').text(text);
                        return;
                    } else if (tagName === 'MD-SELECT') {
                        $attrs.$set('ariaLabel', text);
                        $attrs.$set('placeholder', text);
                        return;
                    }

                    const firstChild = $elem[0].childNodes[0];
                    // if first child is a text node set the text value
                    if (firstChild && firstChild.nodeType === Node.TEXT_NODE) {
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


