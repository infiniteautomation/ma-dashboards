/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

/**
* @ngdoc service
* @name ngMangoServices.maCssInjector
*
* @description
* Provides a service for injecting CSS into the head of the document.
The CSS will only be injected if the directive using this service is used on a page.
*
* # Usage
*
* <pre prettyprint-mode="javascript">
*  // inserts a style tag to style <a> tags with accent color
*  if ($MD_THEME_CSS) {
    const acc = $mdColors.getThemeColor('accent-500-1.0');
    const accT = $mdColors.getThemeColor('accent-500-0.2');
    const accD = $mdColors.getThemeColor('accent-700-1.0');
    const styleContent =
        'a:not(.md-button) {color: ' + acc +'; border-bottom-color: ' + accT + ';}\n' +
        'a:not(.md-button):hover, a:not(.md-button):focus {color: ' + accD + '; border-bottom-color: ' + accD + ';}\n';

    cssInjector.injectStyle(styleContent, null, '[md-theme-style]');
}

// inserts a link tag to an external css file
cssInjector.injectLink('/path/to/myStyles.css', 'myStyles');
* </pre>
*/


/**
* @ngdoc method
* @methodOf ngMangoServices.maCssInjector
* @name cssInjector#isInjected
*
* @description
* A method that returns `true` or `false` based on whether CSS has been injected
* @param {boolean} trackingName Identifier used to determine if CSS has already been injected by another directive.
* @param {boolean} set Boolean value of `true` should be used to state a CSS injection with the given tracking name has taken place.
* @returns {boolean} Returns true or false.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maCssInjector
* @name cssInjector#injectLink
*
* @description
* A method that injects a link to an external CSS file from a link into the document head.
* @param {string} href File path of the external CSS document.
* @param {string} trackingName Identifier used to determine if this particular CSS injection has already been done, as to not duplicate the CSS.
* For example, two directives could utilize the same CSS injection, and if they are both on the same page the injection will only take place once.
* @param {string=} selector If provided the CSS will be injected within the head, after the the given CSS link.
* @param {boolean} insertBefore CSS is injected before the selector instead of after
* Pass a string of the attribute selector ie. `'link[href="/modules/mangoUI/web/vendor/angular-material-data-table/md-data-table.css"]'`
* to insert new CSS link after the specified CSS link. The CSS definitions that come after take precedence.
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maCssInjector
* @name cssInjector#injectStyle
*
* @description
* A method that injects a `<style>` element with CSS into the document head.
* @param {string} content String of CSS that will be injected.
* @param {string} trackingName Identifier used to determine if this particular CSS injection has already been done, as to not duplicate the CSS.
* For example, two directives could utilize the same CSS injection, and if they are both on the same page the injection will only take place once.
* @param {string=} afterSelectorIf provided the CSS will be injected within the head, after the the given CSS style.
* Pass a string of the attribute selector ie. `'link[href="/modules/mangoUI/web/vendor/angular-material-data-table/md-data-table.css"]'`
* to insert new CSS <style> element after the specified CSS link. The CSS definitions that come after take precedence.
*
*/

cssInjectorFactory.$inject = ['$window'];
function cssInjectorFactory($window) {

    const document = $window.document;
    const head = document.head;
    
    class CssInjector {
        isInjected(trackingName) {
            return !!document.querySelector(`[ma-style-name="${trackingName}"]`);
        }
        
        removeStyles(trackingName) {
            const found = document.querySelectorAll(`[ma-style-name="${trackingName}"]`);
            for (let e of found) {
                e.parentNode.removeChild(e);
            }
            return found;
        }
    
        injectLink(href, trackingName, selector, insertBefore) {
            if (trackingName) {
                this.removeStyles(trackingName);
            }
            
            if (href) {
                const linkElement = document.createElement('link');
                linkElement.setAttribute('rel', 'stylesheet');
                linkElement.setAttribute('href', href);
                if (trackingName) {
                    linkElement.setAttribute('ma-style-name', trackingName);
                }
                
                this.insertElement(linkElement, selector, insertBefore);
            }
        }
    
        injectStyle(content, trackingName, selector, insertBefore) {
            if (trackingName) {
                this.removeStyles(trackingName);
            }
    
            if (content) {
                const styleElement = document.createElement('style');
                if (trackingName) {
                    styleElement.setAttribute('ma-style-name', trackingName);
                }
                styleElement.appendChild(document.createTextNode(content));
                
                this.insertElement(styleElement, selector, insertBefore);
            }
        }
        
        insertElement(element, selector, insertBefore) {
            const relativeTo = selector && document.querySelector(selector) || document.head.lastChild;
            if (insertBefore) {
                relativeTo.parentNode.insertBefore(element, relativeTo);
            } else {
                relativeTo.parentNode.insertBefore(element, relativeTo.nextSibling);
            }
        }
    }

    return new CssInjector();
}

export default cssInjectorFactory;
