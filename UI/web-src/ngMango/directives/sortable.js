/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import {Sortable, Draggable} from '@shopify/draggable';

// stops tab index being added to all the trs
// see https://github.com/Shopify/draggable/issues/317
delete Draggable.Plugins.Focusable;

sortableDirective.$inject = [];
function sortableDirective() {

    class SortableController {
        static get $$ngIsClass() { return true; }
        static get $inject() { return ['$scope', '$element', '$attrs']; }

        constructor($scope, $element, $attrs) {
            this.$scope = $scope;
            this.$element = $element;
            this.$attrs = $attrs;
        }

        $onInit() {
            this.setupSortable();
        }

        $onDestroy() {
            this.sortable.destroy();
        }

        isMirrorEnabled() {
            return this.options && this.options.enableMirror;
        }

        setupSortable() {
            const container = this.$element[0];
            this.sortable = new Sortable([container], Object.assign({
                draggable: '[ng-repeat]',
                handle: '.ma-move-handle'
            }, this.options));

            if (!this.isMirrorEnabled()) {
                this.sortable.removePlugin(Draggable.Plugins.Mirror);
            }

            // move the underlying items in the array
            this.sortable.on('sortable:stop', event => {
                // has to be async or angular gets confused trying to keep track of the extra mirror element
                this.$scope.$applyAsync(() => {
                    if (Array.isArray(this.items)) {
                        const removed = this.items.splice(event.oldIndex, 1);
                        this.items.splice(event.newIndex, 0, ...removed);
                    }
                    if (typeof this.stopCallback === 'function') {
                        this.stopCallback({$event: event});
                    }
                });
            });
        }
    }

    return {
        restrict: 'A',
        scope: false,
        controller: SortableController,
        bindToController: {
            options: '<?maSortable',
            items: '<?maSortableItems',
            stopCallback: '&?maSortableStop'
        }
    };
}

export default sortableDirective;
