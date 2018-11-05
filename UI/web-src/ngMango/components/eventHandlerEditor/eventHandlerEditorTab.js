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

eventHandlerEditorTab.$inject = [];
function eventHandlerEditorTab() {

    class EventHandlerEditorTabController {
        static get $$ngIsClass() { return true; }
        static get $inject() { return ['$transclude', '$scope']; }
        
        constructor($transclude, $scope) {
            this.$transclude = $transclude;
            this.$scope = $scope;
        }
        
        $onInit() {
            const tabId = this.tabId;
            
            this.editor.addTab({
                id: tabId,
                label: this.tabLabel,
                labelTr: this.tabLabelTr,
                transclude: this.$transclude,
                padding: this.padding === undefined ? true : !!this.padding
            });
            
            this.$scope.$on('$destroy', () => {
                this.editor.removeTab(tabId);
            });
        }
        
        $onChanges(changes) {
        }
    }
    
    return {
        scope: false,
        transclude: true,
        terminal: true,
        controller: EventHandlerEditorTabController,
        bindToController: {
            tabLabel: '@?',
            tabLabelTr: '@?',
            tabId: '@',
            padding: '<?'
        },
        require: {
            editor: '^maEventHandlerEditor'
        }
    };
}

export default eventHandlerEditorTab;