/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import treeViewTemplate from './treeView.html';
import './treeView.css';

class Context {
    constructor($ctrl, item, parent) {
        this.item = item;
        this.parent = parent;
        this.depth = parent ? parent.depth + 1 : 0;
        this.$q = $ctrl.$q;
        this.$timeout = $ctrl.$timeout;
        this.$ctrl = $ctrl;
        this.loadCount = 0;
        this.offset = 0;
        this.children = [];
        
        if (item) {
            this.hasChildren = $ctrl.hasChildren(item);
            this.retrieveChildren = (offset) => $ctrl.children(this.item, offset);
            
            if (this.hasChildren && $ctrl.expanded(item, this.depth)) {
                this.toggleChildren();
            }
        }
    }

    loadChildren() {
        delete this.limited;
        const children = this.retrieveChildren(this.offset);
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
                this.updateChildren(resolvedChildren);

                if (Number.isFinite(resolvedChildren.$total)) {
                    this.total = resolvedChildren.$total;
                    this.offset += resolvedChildren.length;
                    this.limited = this.total > this.children.length;
                }
            }
        }, error => {
            this.loadError = error && (error.mangoStatusText || error.localizedMessage) || ('' + error);
        }, progressChildren => {
            if (Array.isArray(progressChildren) && this.loadCount === count) {
                this.updateChildren(progressChildren);
                showResults();
            }
        });
        
        this.childrenPromise.finally(showResults);
    }
    
    updateChildren(newChildren) {
        // context is created via a ng-init for each object tracked by id
        // we need to update the existing item if it exists so the item in the context is updated
        const existingById = this.children.reduce((map, e) => (map[this.$ctrl.id(e)] = e, map), {});
        newChildren.forEach(c => {
            const id = this.$ctrl.id(c);
            const existing = existingById[id];
            if (existing) {
                Object.assign(existing, c);
            } else {
                this.children.push(c);
            }
        });
    }
    
    toggleChildren() {
        this.showChildren = !this.showChildren;
        if (this.showChildren) {
            this.loadChildren();
        } else {
            this.removeChildren();
        }
    }

    removeChildren() {
        this.children = [];
        this.offset = 0;
        delete this.loadError;
    }
}
    
class TreeViewController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$scope', '$transclude', '$q', '$timeout']; }
    
    constructor($scope, $transclude, $q, $timeout) {
        this.$scope = $scope;
        this.$transclude = $transclude;
        this.$q = $q;
        this.$timeout = $timeout;

        this.$scope.context = new Context(this);
        this.$scope.context.retrieveChildren = () => this.items;
        this.limit = 100;
    }
    
    $onChanges(changes) {
        if (changes.items) {
            this.$scope.context.removeChildren();
            this.$scope.context.loadChildren();
        }
    }
    
    newContext(item, parent) {
        return new Context(this, item, parent);
    }

    id(item) {
        if (typeof this.itemId === 'function') {
            return this.itemId({$item: item});
        }
        return item.id;
    }
    
    hasChildren(item) {
        if (typeof this.itemHasChildren === 'function') {
            return this.itemHasChildren({$item: item});
        }
        return Array.isArray(item.children) && item.children.length;
    }

    children(item, offset = 0) {
        if (typeof this.itemChildren === 'function') {
            return this.itemChildren({$item: item, $limit: this.limit, $offset: offset});
        } else {
            return item.children;
        }
    }
    
    expanded(item, depth) {
        if (typeof this.itemExpanded === 'function') {
            return this.itemExpanded({$item: item, $depth: depth});
        } else {
            return false;
        }
    }
}

export default {
    template: treeViewTemplate,
    controller: TreeViewController,
    bindings: {
        items: '<',
        itemId: '&?',
        itemChildren: '&?',
        itemHasChildren: '&?',
        itemExpanded: '&?',
        limit: '<?'
    },
    transclude: true
};
