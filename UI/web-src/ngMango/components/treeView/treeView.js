/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import treeViewTemplate from './treeView.html';
import './treeView.css';

class TreeViewController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$scope', '$transclude']; }
    
    constructor($scope, $transclude) {
        this.$scope = $scope;
        this.$transclude = $transclude;
        
        this.$scope.level = 0;
    }
    
    $onChanges(changes) {
        this.$scope.children = this.items;
    }

    id(item) {
        if (typeof this.itemId === 'function') {
            return this.itemId({$item: item});
        }
        return item.id;
    }

    children(item) {
        if (typeof this.itemChildren === 'function') {
            return this.itemChildren({$item: item});
        }
        return item.children;
    }
}

export default {
    template: treeViewTemplate,
    controller: TreeViewController,
    bindings: {
        items: '<',
        itemId: '&?',
        itemChildren: '&?'
    },
    transclude: true
};
