/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import treeViewItemTemplate from './treeViewItem.html';

class TreeViewItemController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$element', '$scope', '$q', '$timeout']; }
    
    constructor($element, $scope, $q, $timeout) {
        this.$element = $element;
        this.$scope = $scope;
        this.$q = $q;
        this.$timeout = $timeout;

        this.expanded = false;
        this.loadCount = 0; // TODO remove
        this.offset = 0;
        this.children = [];
    }

    $onInit() {
        this.$element.addClass('ma-tree-view-depth-' + this.depth);
    }

    $onChanges(changes) {
        if (changes.item) {
            this.removeChildren();
            this.hasChildren = this.treeViewCtrl.hasChildren(this.item, this.depth);
            this.$element.toggleClass('ma-tree-view-has-children', this.hasChildren);
            this.expanded = this.hasChildren && this.treeViewCtrl.expanded(this.item, this.depth, this.expanded);
            this.expandedChanged();
        }
    }

    loadChildren() {
        delete this.limited;
        const children = this.treeViewCtrl.children(this.item, this.depth, this.offset);
        const loadingDelay = this.$timeout(() => this.loading = true, 200);
        const count = ++this.loadCount;

        const showResults = () => {
            this.$timeout.cancel(loadingDelay);
            if (this.loadCount === count) {
                delete this.childrenPromise;
                delete this.loading;
            }
        };

        this.childrenPromise = this.$q.when(children).then(resolvedChildren => {
            if (this.loadCount === count) {
                if (Array.isArray(resolvedChildren)) {
                    this.updateChildren(resolvedChildren);

                    if (Number.isFinite(resolvedChildren.$total)) {
                        this.total = resolvedChildren.$total;
                        this.offset += resolvedChildren.length;
                        this.limited = this.total > this.children.length;
                    }
                } else {
                    this.removeChildren();
                }
            }
        }, error => {
            this.loadError = error && (error.mangoStatusText || error.localizedMessage) || ('' + error);
        }, progressChildren => {
            // TODO where is this used? BACNet?
            if (Array.isArray(progressChildren) && this.loadCount === count) {
                this.updateChildren(progressChildren);
                showResults();
            }
        });

        this.childrenPromise.finally(showResults);
    }

    updateChildren(updated) {
        updated.forEach((child, i) => {
            this.children[this.offset + i] = child;
        });
    }

    toggleExpanded() {
        this.expanded = !this.expanded;
        this.expandedChanged();
    }

    expandedChanged() {
        if (this.expanded) {
            this.loadChildren();
        } else {
            this.removeChildren();
        }
        this.$element.toggleClass('ma-tree-view-open', this.expanded);
    }

    removeChildren() {
        this.children = [];
        this.offset = 0;
        delete this.loadError;
    }

    id(item) {
        return this.treeViewCtrl.id(item, this.depth);
    }
}

export default {
    template: treeViewItemTemplate,
    controller: TreeViewItemController,
    require: {
        treeViewCtrl: '^^maTreeView',
        parent: '?^^maTreeViewItem'
    },
    bindings: {
        item: '<',
        depth: '<'
    }
};
