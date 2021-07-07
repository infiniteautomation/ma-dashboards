/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import treeViewTemplate from './treeView.html';
import './treeView.css';

class RootItem {}

class TreeViewController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$scope', '$element', '$transclude']; }
    
    constructor($scope, $element, $transclude) {
        this.$scope = $scope;
        this.$element = $element;
        // used in maTreeViewItemTransclude
        this.$transclude = $transclude;

        this.showRootLabel = false;
        this.rootItem = new RootItem();
    }

    $onChanges(changes) {
        if (changes.showRootLabel) {
            this.$element.toggleClass('ma-show-root-label', !!this.showRootLabel);
        }
        if (changes.reload && !changes.reload.isFirstChange()) {
            this.rootItem = new RootItem();
        }
    }

    id(item, depth) {
        if (typeof this.itemId === 'function') {
            return this.itemId({$item: item, $depth: depth, $isRoot: item instanceof RootItem});
        }
        return item.xid || item.id;
    }
    
    hasChildren(item, depth) {
        if (typeof this.itemHasChildren === 'function') {
            return this.itemHasChildren({$item: item, $depth: depth, $isRoot: item instanceof RootItem});
        }
        return Array.isArray(item.children) && item.children.length;
    }

    children(item, depth, existingChildren, loadMore) {
        if (typeof this.itemChildren === 'function') {
            return this.itemChildren({$item: item, $depth: depth, $isRoot: item instanceof RootItem,
                $existing: existingChildren, $loadMore: loadMore});
        } else {
            return item.children;
        }
    }
    
    expanded(item, depth, expanded) {
        if (typeof this.itemExpanded === 'function') {
            return this.itemExpanded({$item: item, $depth: depth, $expanded: expanded, $isRoot: item instanceof RootItem});
        } else {
            return expanded || depth === 0;
        }
    }
}

export default {
    template: treeViewTemplate,
    controller: TreeViewController,
    bindings: {
        showRootLabel: '<?',
        reload: '<?',
        itemId: '&?',
        itemChildren: '&?loadChildren',
        itemHasChildren: '&?hasChildren',
        itemExpanded: '&?expanded'
    },
    transclude: true
};
