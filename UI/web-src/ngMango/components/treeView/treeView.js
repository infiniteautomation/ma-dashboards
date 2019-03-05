/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import treeViewTemplate from './treeView.html';
import './treeView.css';

const defaultItems = [
    {id: 1, children: [], label: 'item 1'},
    {id: 2, children: [
        {id: 21, children: [{id: 211, children: [], label: 'item 211'}], label: 'item 21'},
        {id: 22, children: [], label: 'item 22'}
    ], label: 'item 2'},
    {id: 3, children: [], label: 'item 3'}
];

class TreeViewController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$scope', '$transclude']; }
    
    constructor($scope, $transclude) {
        this.$scope = $scope;
        this.$transclude = $transclude;
    }
    
    $onChanges(changes) {
        this.$scope.children = this.items || defaultItems;
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
