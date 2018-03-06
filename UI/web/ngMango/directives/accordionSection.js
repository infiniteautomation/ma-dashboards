/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

accordionSection.$inject = [];
function accordionSection() {
    return {
        restrict: 'E',
        transclude: true,
        require: '?^^maAccordion',
        scope: {
            maAccordionOpen: '<?'
        },
        template: '<div class="ma-slide-up" ng-if="accordionController.section[id]" ng-transclude></div>',
        link: function ($scope, $element, $attrs, accordionController) {
            var id = $attrs.id;

            $scope.accordionController = accordionController;
            $scope.id = id;

            if ($scope.maAccordionOpen) {
                accordionController.open(id);
            }
        },
        designerInfo: {
            hideFromMenu: true
        }
    };
}

export default accordionSection;


