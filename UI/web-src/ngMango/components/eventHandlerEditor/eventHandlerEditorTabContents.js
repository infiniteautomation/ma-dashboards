/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

/**
 * @ngdoc directive
 * @name ngMango.directive:maEventHandlerEditorTab
 * @restrict E
 * @description Adds a tab to the parent event handler editor.
 */

eventHandlerEditorTabContents.$inject = [];
function eventHandlerEditorTabContents() {

    class EventHandlerEditorTabContentsController {
        static get $$ngIsClass() { return true; }
        static get $inject() { return ['$element']; }
        
        constructor($element) {
            this.$element = $element;
        }
        
        $onInit() {
        }
        
        $onChanges(changes) {
            if (changes.tab) {
                this.transcludeTab();
            }
        }
        
        transcludeTab() {
            this.$element.empty();
            if (this.tab && this.tab.transclude) {
                this.tab.transclude((clone, scope) => {
                    this.$element.append(clone);
                });
            }
        }
    }
    
    return {
        scope: false,
        controller: EventHandlerEditorTabContentsController,
        bindToController: {
            tab: '<maEventHandlerEditorTabContents'
        }
    };
}

export default eventHandlerEditorTabContents;