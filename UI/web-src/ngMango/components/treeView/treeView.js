/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import treeViewTemplate from './treeView.html';
import './treeView.css';

class TreeViewController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$scope', '$transclude', '$q', '$timeout']; }
    
    constructor($scope, $transclude, $q, $timeout) {
        this.$scope = $scope;
        this.$transclude = $transclude;
        this.$q = $q;
        this.$timeout = $timeout;

        this.$scope.context = {
            level: 0
        };
    }
    
    $onChanges(changes) {
        this.loadChildren(this.items, this.$scope.context);
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

    children(item, context) {
        let children;
        if (typeof this.itemChildren === 'function') {
            children = this.itemChildren({$item: item});
        } else {
            children = item.children;
        }
        this.loadChildren(children, context);
    }
    
    loadChildren(children, context) {
        let c = children;
        children = this.$timeout(() => c, 1000);
        
        const p = context.itemsPromise = this.$q.when(children).then(children => {
            context.items = children;
        });
        
        p.finally(() => {
            if (context.itemsPromise === p) {
                delete context.itemsPromise;
            }
        });
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
