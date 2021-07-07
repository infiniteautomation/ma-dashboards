/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import angular from 'angular';

class DraggableController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$scope', '$element']; }

    constructor($scope, $element) {
        this.$scope = $scope;
        this.$element = $element;
    }

    $onInit() {
        const $element = this.$element;

        this.setDraggableAttr();

        $element.on('dragstart', $event => {
            const event = $event.originalEvent || $event;
            if ($element.attr('draggable') == null) return true;
            if (typeof this.data !== 'string') {
                const json = angular.toJson(this.data);
                event.dataTransfer.setData('application/json', json);
            } else {
                event.dataTransfer.setData('text/plain', this.data);
            }
            event.dataTransfer.effectAllowed = this.effectAllowed || 'move';
            $event.stopPropagation();
        });
    }

    $onChanges(changes) {
        if (changes.draggable) {
            this.setDraggableAttr();
        }
    }

    setDraggableAttr() {
        this.$element.attr('draggable', this.draggable == null || this.draggable);
    }
}
draggable.$inject = [];
function draggable() {
    return {
        restrict: 'A',
        scope: false,
        bindToController: {
            draggable: '<?maDraggable',
            data: '<?maDragData',
            effectAllowed: '<?maEffectAllowed'
        },
        controller: DraggableController
    };
}

export default draggable;