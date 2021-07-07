/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
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
            const id = $attrs.sectionId || $attrs.id;

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
