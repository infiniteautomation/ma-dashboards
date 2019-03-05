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
            maTreeViewCtrl.$transclude(($el, $trScope) => {
                $scope.$on('$destroy', () => $trScope.$destroy());
                $trScope.$item = $scope.item;
                $trScope.$parentItem = $scope.parent;
                $trScope.$level = $scope.level;
                $element.append($el);
            });
        },
        require: '^maTreeView'
    };
}

export default treeViewTransclude;