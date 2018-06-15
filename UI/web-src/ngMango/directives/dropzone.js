/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';


dropzone.$inject = [];
function dropzone() {
    return {
        restrict: 'A',
        scope: false,
        bindToController: {
            dragEnter: '&?maDragEnter',
            dragOver: '&?maDragOver',
            dragLeave: '&?maDragLeave',
            drop: '&?maDrop'
        },
        controller: DropzoneController
    };
}

DropzoneController.$inject = ['$scope', '$element'];
function DropzoneController($scope, $element) {
    this.$scope = $scope;
    this.$element = $element;
}

DropzoneController.prototype.$onInit = function() {
    const $ctrl = this;
    const $element = this.$element;
    const $scope = this.$scope;
    
    $element.on('dragenter', function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $ctrl.currentTarget = $event.target;
        if ($ctrl.dragEnter) {
            $scope.$apply(function() {
                $ctrl.dragEnter({$event: $event, $data: new DragInfo($event, $element)});
            });
        }
    });
    $element.on('dragover', function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        if ($ctrl.dragOver) {
            $scope.$apply(function() {
                $ctrl.dragOver({$event: $event, $data: new DragInfo($event, $element)});
            });
        }
    });
    $element.on('dragleave', function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        if ($ctrl.currentTarget !== $event.target) {
            // we are still dragging over a child of this element
            return;
        }
        if ($ctrl.dragLeave) {
            $scope.$apply(function() {
                $ctrl.dragLeave({$event: $event, $data: new DragInfo($event, $element)});
            });
        }
    });
    $element.on('drop', function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        if ($ctrl.drop) {
            $scope.$apply(function() {
                $ctrl.drop({$event: $event, $data: new DragInfo($event, $element)});
            });
        }
    });
};

function DragInfo($event, $element) {
    this.$event = $event;
    this.$element = $element;
}

DragInfo.prototype.getDataTransferTypes = function() {
    const event = this.$event.originalEvent || this.$event;
    const dataTransfer = event.dataTransfer;
    return dataTransfer.types;
};

DragInfo.prototype.getDataTransfer = function() {
    const event = this.$event.originalEvent || this.$event;
    const dataTransfer = event.dataTransfer;
    if (dataTransfer.files && dataTransfer.files.length) {
        return dataTransfer.files;
    }
    const json = dataTransfer.getData('application/json');
    if (json) {
        try {
            return angular.fromJson(json);
        } catch (e) {
        }
    }
    return dataTransfer.getData('text/plain');
};

DragInfo.prototype.getCoordinates = function getCoordinates() {
    return {
        left: Math.round(this.$event.pageX - this.$element.offset().left),
        top: Math.round(this.$event.pageY - this.$element.offset().top)
    };
};

export default dropzone;


