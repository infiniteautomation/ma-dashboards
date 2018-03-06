/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

export default function() {
    class FixSortIconsController {
        static get $inject() { return ['$element', '$timeout']; }
        static get $$ngIsClass() { return true; }
        
        constructor($element, $timeout) {
            this.$element = $element;
            this.$timeout = $timeout;
        }
        
        $onInit() {
            this.$timeout(() => {
                const icons = Array.from(this.$element[0].querySelectorAll('.md-numeric md-icon.md-sort-icon'));
                icons.forEach(i => {
                    const parent = i.parentNode;
                    parent.insertBefore(i, parent.firstChild);
                });
            }, 0);
        }
    }
    
    return {
        restrict: 'A',
        scope: false,
        controller: FixSortIconsController
    };
}
