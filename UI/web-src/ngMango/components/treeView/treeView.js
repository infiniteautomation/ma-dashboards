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
        
        if (item) {
            this.hasChildren = $ctrl.hasChildren(item);
            this.retrieveChildren = () => $ctrl.children(this.item);
        }
    }

    loadChildren() {
        const children = this.retrieveChildren();

        const p = this.childrenPromise = this.$q.when(children).then(children => {
            this.children = children;
        });
        
        p.finally(() => {
            if (this.childrenPromise === p) {
                delete this.childrenPromise;
            }
        });
    }
}

class TreeViewController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$scope', '$transclude', '$q']; }
    
    constructor($scope, $transclude, $q) {
        this.$scope = $scope;
        this.$transclude = $transclude;
        this.$q = $q;

        this.$scope.context = new Context(this);
        this.$scope.context.retrieveChildren = () => this.items;
    }
    
    $onChanges(changes) {
        this.$scope.context.loadChildren();
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

    children(item) {
        if (typeof this.itemChildren === 'function') {
            return this.itemChildren({$item: item});
        } else {
            return item.children;
        }
    }
    
    itemClicked(context) {
        context.showChildren = !context.showChildren;
        if (context.showChildren) {
            context.loadChildren();
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
        itemHasChildren: '&?'
    },
    transclude: true
};
