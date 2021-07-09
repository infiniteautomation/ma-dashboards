/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import angular from 'angular';


class ScaleToController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$scope', '$element', '$window', '$timeout', '$interval']; }
    constructor($scope, $element, $window, $timeout, $interval) {
        this.$scope = $scope;
        this.$element = $element;
        this.$window = $window;
        this.$timeout = $timeout;
        this.$interval = $interval;

        this.originalCss = {
            position: $element.css('position'),
            left: $element.css('left'),
            top: $element.css('top'),
            transform: $element.css('transform'),
            'transform-origin': $element.css('transform-origin')
        };
        
        this.maintainRatio = 'letterbox';
        this.center = false;
    }

    $onInit() {
        this.findScaleToElement();
        
        if (this.scaleTo) {
            this.bindHandler();
            this.scaleElement();
        }
        
        this.$scope.$on('$destroy', () => {
            this.unbindHandler();
        });
    }

    $onChanges(changes) {
        if (changes.scaleTo) {
            if (this.scaleTo) {
                this.findScaleToElement();
                this.bindHandler();
                this.scaleElement();
            } else {
                this.unbindHandler();
                this.removeScaling();
            }
        }
        if (changes.maintainRatio || changes.center) {
            if (this.scaleTo) {
                this.scaleElement();
            }
        }
    }
    
    findScaleToElement() {
        let elements;
        if (this.scaleTo === 'window') {
            elements = [this.$window.document.body];
        } else if (this.scaleTo) {
            elements = this.$window.document.querySelectorAll(this.scaleTo);
        } else {
            elements = [];
        }

        this.$scaleToElement = angular.element(elements);
    }

    bindHandler() {
        if (!this.resizeHandler) {
            this.resizeHandler = (event) => {
                this.scaleElement(event);
            };
            angular.element(this.$window).on('resize', this.resizeHandler);
        }
        
        if (!this.intervalPromise) {
            this.intervalPromise = this.$interval(() => {
                this.scaleElement();
            }, 1000, 0, false);
        }
    }

    unbindHandler() {
        if (this.resizeHandler) {
            angular.element(this.$window).off('resize', this.resizeHandler);
            delete this.resizeHandler;
        }
        if (this.intervalPromise) {
            this.$interval.cancel(this.intervalPromise);
            delete this.intervalPromise;
        }
    }

    removeScaling() {
        const originalCss = this.originalCss;
        this.$element.css('transform', originalCss.transform);
        this.$element.css('transform-origin', originalCss['transform-origin']);
        this.$element.css('position', originalCss.position);
        this.$element.css('left', originalCss.left);
        this.$element.css('top', originalCss.top);
    }

    scaleElement($event) {
        if (!this.$scaleToElement.length) return;
        
        const elementWidth = parseInt(this.$element[0].style.width, 10);
        const elementHeight = parseInt(this.$element[0].style.height, 10);
        const scaleToBoundingClientRect = this.$scaleToElement[0].getBoundingClientRect();
        const windowWidth = scaleToBoundingClientRect.width;
        const windowHeight = scaleToBoundingClientRect.height;

        let widthRatio = windowWidth / elementWidth;
        let heightRatio = windowHeight / elementHeight;

        //console.log('element('+elementWidth+','+elementHeight+') window('+windowWidth+','+windowHeight+')');
        //console.log('heightRatio:' + heightRatio + ' widthRatio:'+widthRatio);

        if (this.maintainRatio === 'clip') {
            if (heightRatio > widthRatio) {
                widthRatio = heightRatio;
            } else {
                heightRatio = widthRatio;
            }
        } else if (this.maintainRatio === 'letterbox') {
            if (heightRatio < widthRatio) {
                widthRatio = heightRatio;
            } else {
                heightRatio = widthRatio;
            }
        } else if (this.maintainRatio === 'to-height') {
            widthRatio = heightRatio;
        } else if (this.maintainRatio === 'to-width') {
            heightRatio = widthRatio;
        }

        const widthRemainder = windowWidth - elementWidth * widthRatio;
        const heightRemainder = windowHeight - elementHeight * heightRatio;
        
        this.$element.css('transform', 'scale(' + widthRatio + ',' + heightRatio + ')');
        this.$element.css('transform-origin', '0 0');
        this.$element.css('position', 'absolute');
        if (this.center) {
            this.$element.css('left', widthRemainder/2 + 'px');
            this.$element.css('top', heightRemainder/2 + 'px');
        } else {
            this.$element.css('left', '0');
            this.$element.css('top', '0');
        }
        
        // run again on next digest if scaleElement was triggered by a resize event
        // re-calc height/width after scrollbars are removed
        if ($event) {
            this.$timeout(() => {
                this.scaleElement();
            }, 0, false);
        }
    }
}

ScaleTo.$inject = [];
function ScaleTo() {
    return {
        restrict: 'A',
        scope: false,
        bindToController: {
            scaleTo: '@?maScaleTo',
            maintainRatio: '@?maMaintainRatio',
            center: '<?maCenter'
        },
        controller: ScaleToController
    };
}

export default ScaleTo;


