/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import angular from 'angular';

class DragInfo {
    constructor($event, $element) {
        this.$event = $event;
        this.$element = $element;
    }

    getDataTransferTypes() {
        const event = this.$event.originalEvent || this.$event;
        const dataTransfer = event.dataTransfer;
        return dataTransfer.types;
    }

    getDataTransfer() {
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
    }

    getCoordinates() {
        return {
            left: Math.round(this.$event.pageX - this.$element.offset().left),
            top: Math.round(this.$event.pageY - this.$element.offset().top)
        };
    }
}

class DropzoneController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$scope', '$element']; }

    constructor($scope, $element) {
        this.$scope = $scope;
        this.$element = $element;
    }

    $onInit() {
        const $element = this.$element;
        const $scope = this.$scope;

        $element.on('dragenter', $event => {
            $event.preventDefault();
            $event.stopPropagation();
            this.currentTarget = $event.target;
            if (this.dragEnter) {
                $scope.$apply(() => {
                    this.dragEnter({$event: $event, $data: new DragInfo($event, $element)});
                });
            }
        });
        $element.on('dragover', $event => {
            $event.preventDefault();
            $event.stopPropagation();
            if (this.dragOver) {
                $scope.$apply(() => {
                    this.dragOver({$event: $event, $data: new DragInfo($event, $element)});
                });
            }
        });
        $element.on('dragleave', $event => {
            $event.preventDefault();
            $event.stopPropagation();
            if (this.currentTarget !== $event.target) {
                // we are still dragging over a child of this element
                return;
            }
            if (this.dragLeave) {
                $scope.$apply(() => {
                    this.dragLeave({$event: $event, $data: new DragInfo($event, $element)});
                });
            }
        });
        $element.on('drop', $event => {
            $event.preventDefault();
            $event.stopPropagation();
            if (this.drop) {
                $scope.$apply(() => {
                    this.drop({$event: $event, $data: new DragInfo($event, $element)});
                });
            }
        });
    }
}

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

export default dropzone;