/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

treeViewTransclude.$inject = [];
function treeViewTransclude() {
    return {
        restrict: 'A',
        scope: false,
        link: function($scope, $element, $attrs, maTreeViewCtrl) {
            const context = $scope.itemContext;
            maTreeViewCtrl.$transclude(($el, $trScope) => {
                $scope.$on('$destroy', () => $trScope.$destroy());

                $trScope.$context = context;
                $trScope.$item = context.item;
                $trScope.$depth = context.depth;
                $trScope.$hasChildren = context.hasChildren;

                $element.append($el);
            });
        },
        require: '^maTreeView'
    };
}

export default treeViewTransclude;