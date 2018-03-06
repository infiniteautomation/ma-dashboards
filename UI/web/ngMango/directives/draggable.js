/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';


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

DraggableController.$inject = ['$scope', '$element'];
function DraggableController($scope, $element) {
    this.$scope = $scope;
    this.$element = $element;
}

DraggableController.prototype.$onInit = function() {
    var $ctrl = this;
    var $element = this.$element;

    this.setDraggableAttr();
    
    $element.on('dragstart', function($event) {
        var event = $event.originalEvent || $event;
        if ($element.attr('draggable') == null) return true;
        if (typeof $ctrl.data !== 'string') {
            var json = angular.toJson($ctrl.data);
            event.dataTransfer.setData('application/json', json);
        } else {
            event.dataTransfer.setData('text/plain', $ctrl.data);
        }
        event.dataTransfer.effectAllowed = $ctrl.effectAllowed || 'move';
        $event.stopPropagation();
    });
};

DraggableController.prototype.$onChanges = function(changes) {
    if (changes.draggable) {
        this.setDraggableAttr();
    }
};

DraggableController.prototype.setDraggableAttr = function() {
    this.$element.attr('draggable', this.draggable == null || this.draggable);
};

export default draggable;


