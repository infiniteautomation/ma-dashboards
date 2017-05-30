/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';

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

ScaleToController.$inject = ['$scope', '$element', '$window', '$timeout'];
function ScaleToController($scope, $element, $window, $timeout) {
    this.$scope = $scope;
    this.$element = $element;
    this.$window = $window;
    this.$timeout = $timeout;

    this.handlerAttached = false;
    this.resizeHandler = this.scaleElement.bind(this);

    $element.data('maScaleToOriginalCss', {
        position: $element.css('position'),
        left: $element.css('left'),
        top: $element.css('top'),
        transform: $element.css('transform'),
        'transform-origin': $element.css('transform-origin')
    });
}

ScaleToController.prototype.$onInit = function() {
    // jshint eqnull:true
    var $ctrl = this;
    
    if (this.maintainRatio == null || this.maintainRatio === '')
        this.maintainRatio = 'letterbox';
    if (this.center == null)
        this.center = false;

    this.$scaleToElement = angular.element(this.scaleTo === 'window' ? this.$window.document.body : this.scaleTo);
    
    if (this.scaleTo) {
        this.bindHandler();
        this.scaleElement();
    }
    
    this.$scope.$on('$destroy', function() {
        $ctrl.unbindHandler();
    });
};

ScaleToController.prototype.$onChanges = function(changes) {
    if (changes.scaleTo) {
        if (this.scaleTo) {
            this.$scaleToElement = angular.element(this.scaleTo === 'window' ? this.$window.document.body : this.scaleTo);
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
};

ScaleToController.prototype.bindHandler = function bindHandler() {
    if (!this.handlerAttached) {
        angular.element(this.$window).on('resize', this.resizeHandler);
        this.handlerAttached = true;
    }
};

ScaleToController.prototype.unbindHandler = function unbindHandler() {
    if (this.handlerAttached) {
        angular.element(this.$window).off('resize', this.resizeHandler);
        this.handlerAttached = false;
    }
};

ScaleToController.prototype.removeScaling = function removeScaling() {
    var originalCss = this.$element.data('maScaleToOriginalCss');
    this.$element.css('transform', originalCss.transform);
    this.$element.css('transform-origin', originalCss['transform-origin']);
    this.$element.css('position', originalCss.position);
    this.$element.css('left', originalCss.left);
    this.$element.css('top', originalCss.top);
};

ScaleToController.prototype.scaleElement = function scaleElement($event) {
    if (this.$element.hasClass('ma-designer-element')) return;
    
    var elementWidth = parseInt(this.$element[0].style.width, 10);
    var elementHeight = parseInt(this.$element[0].style.height, 10);
    var scaleToBoundingClientRect = this.$scaleToElement[0].getBoundingClientRect();
    var windowWidth = scaleToBoundingClientRect.width;
    var windowHeight = scaleToBoundingClientRect.height;

    var widthRatio = windowWidth / elementWidth;
    var heightRatio = windowHeight / elementHeight;

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

    var widthRemainder = windowWidth - elementWidth * widthRatio;
    var heightRemainder = windowHeight - elementHeight * heightRatio;
    
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
        this.$timeout(function() {
            this.scaleElement();
        }.bind(this), 0);
    }
};

return ScaleTo;

}); // define
