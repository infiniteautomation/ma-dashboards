/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

treeViewTransclude.$inject = [];
function treeViewTransclude() {
    return {
        restrict: 'A',
        scope: false,
        link: function($scope, $element, $attrs, {treeView, treeViewItem}) {
            // create a transclude scope from the maTreeView's parent scope
            const outsideScope = treeView.$scope.$parent;
            const trScope = outsideScope.$new(false, $scope);

            treeView.$transclude(trScope, (clone, scope) => {
                scope.$treeCtrl = treeViewItem;
                Object.defineProperties(scope, {
                    $expanded: {get: () => treeViewItem.expanded},
                    $item: {get: () => treeViewItem.item},
                    $parentItem: {get: () => treeViewItem.parent && treeViewItem.parent.item},
                    $depth: {get: () => treeViewItem.depth},
                    $hasChildren: {get: () => treeViewItem.hasChildren}
                });
                $element.append(clone);
            }, $element);
        },
        require: {
            treeView: '^^maTreeView',
            treeViewItem: '^^maTreeViewItem'
        }
    };
}

export default treeViewTransclude;