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
    }
    
    $onChanges(changes) {
        this.$scope.children = this.items;
    }

    id(item) {
        return item.id;
    }

    children(item) {
        return item.children;
    }
}

export default {
    template: treeViewTemplate,
    controller: TreeViewController,
    bindings: {
        items: '<'
    },
    transclude: true
};
