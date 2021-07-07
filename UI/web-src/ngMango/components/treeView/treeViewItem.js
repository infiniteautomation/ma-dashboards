/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
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
        this.children = [];
    }

    $onInit() {
        this.$element.addClass('ma-tree-view-depth-' + this.depth);
    }

    $onChanges(changes) {
        if (changes.item) {
            this.children = [];
            this.updateHasChildren();
            this.expanded = this.hasChildren && this.treeViewCtrl.expanded(this.item, this.depth, this.expanded);
            this.expandedChanged();
        }
    }

    $doCheck() {
        this.updateHasChildren();
    }

    updateHasChildren() {
        const hasChildren = this.treeViewCtrl.hasChildren(this.item, this.depth);
        if (hasChildren !== this.hasChildren) {
            if (!hasChildren) {
                this.expanded = false;
                this.expandedChanged();
            }
            this.hasChildren = hasChildren;
            this.$element.toggleClass('ma-tree-view-has-children', this.hasChildren);
        }
    }

    loadChildren(loadMore = false) {
        delete this.loadError;
        delete this.showLoading;
        this.loading = true;
        this.$timeout.cancel(this.showLoadingDelay);
        this.showLoadingDelay = this.$timeout(() => this.showLoading = true, 200);

        if (this.deferred) {
            this.deferred.reject(CANCELLED);
        }

        this.deferred = this.$q.defer();
        const childrenPromise = this.treeViewCtrl.children(this.item, this.depth, this.children, loadMore);
        this.$q.when(childrenPromise).then(this.deferred.resolve, this.deferred.reject, this.deferred.notify);

        this.deferred.promise.then(children => {
            if (Array.isArray(children)) {
                this.children = children;
            } else {
                this.children = [];
            }
            this.showResult();
        }, error => {
            if (error !== CANCELLED) {
                this.loadError = error && (error.mangoStatusText || error.localizedMessage) || ('' + error);
                this.showResult();
            }
        }, children => {
            // progress callback, used by BACnet WHOIS
            if (Array.isArray(children)) {
                this.children = children;
                this.showResult();
            }
        });
    }

    showResult() {
        this.$timeout.cancel(this.showLoadingDelay);
        delete this.loading;
        delete this.showLoading;
    }

    toggleExpanded() {
        this.expanded = !this.expanded;
        this.expandedChanged();
    }

    expandedChanged() {
        if (this.expanded) {
            this.loadChildren();
        } else {
            this.children = [];
        }
        this.$element.toggleClass('ma-tree-view-open', this.expanded);
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
