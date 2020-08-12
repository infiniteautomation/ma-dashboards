/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import treeViewItemTemplate from './treeViewItem.html';
const CANCELLED = Symbol('cancelled');

class TreeViewItemController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$element', '$scope', '$q', '$timeout']; }
    
    constructor($element, $scope, $q, $timeout) {
        this.$element = $element;
        this.$scope = $scope;
        this.$q = $q;
        this.$timeout = $timeout;

        this.expanded = false;
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
        this.$timeout.cancel(this.showLoadingDelay);
        this.showLoadingDelay = this.$timeout(() => this.showLoading = true, 200);

        if (this.loading) {
            this.loading.reject(CANCELLED);
        }

        this.loading = this.$q.defer();
        const childrenPromise = this.treeViewCtrl.children(this.item, this.depth, this.offset);
        this.$q.when(childrenPromise).then(this.loading.resolve, this.loading.reject);

        this.loading.promise.then(children => {
            if (Array.isArray(children)) {
                this.updateChildren(children);

                if (Number.isFinite(children.$total)) {
                    this.total = children.$total;
                    this.offset += children.length;
                    this.limited = this.total > this.children.length;
                }
            } else {
                this.removeChildren();
            }
            this.showResult();
        }, error => {
            console.log(error);
            if (error !== CANCELLED) {
                this.loadError = error && (error.mangoStatusText || error.localizedMessage) || ('' + error);
                this.showResult();
            }
        }, children => {
            // progress callback, used by BACnet WHOIS
            if (Array.isArray(children)) {
                this.updateChildren(children);
                this.showResult();
            }
        });
    }

    showResult() {
        this.$timeout.cancel(this.showLoadingDelay);
        delete this.loading;
        delete this.showLoading;
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
