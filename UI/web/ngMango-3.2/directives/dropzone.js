/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';

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
    var $ctrl = this;
    var $element = this.$element;
    var $scope = this.$scope;
    
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
    var event = this.$event.originalEvent || this.$event;
    var dataTransfer = event.dataTransfer;
    return dataTransfer.types;
};

DragInfo.prototype.getDataTransfer = function() {
    var event = this.$event.originalEvent || this.$event;
    var dataTransfer = event.dataTransfer;
    if (dataTransfer.files && dataTransfer.files.length) {
        return dataTransfer.files;
    }
    var json = dataTransfer.getData('application/json');
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

return dropzone;

}); // define
