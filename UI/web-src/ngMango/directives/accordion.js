/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

accordion.$inject = [];
function accordion() {
    return {
        restrict: 'A',
        scope: false,
        link: function($scope, $element, attrs, controller) {
            $scope[attrs.maAccordion] = controller;
            if (attrs.maAccordionSingle != null) {
                controller.single = true;
            }
        },
        controller: AccordionController
    };
}

AccordionController.$inject = [];
function AccordionController() {
    this.section = {};
}

AccordionController.prototype.open = function open(id) {
    if (this.single) {
        for (const sectionId in this.section) {
            this.section[sectionId] = false;
        }
    }

    this.section[id] = true;
};

AccordionController.prototype.close = function close(id) {
    this.section[id] = false;
};

AccordionController.prototype.toggle = function toggle(id) {
    if (this.section[id]) {
        this.close(id);
    } else {
        this.open(id);
    }
};

export default accordion;
