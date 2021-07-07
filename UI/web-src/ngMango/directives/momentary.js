/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

/**
 * @ngdoc directive
 * @name ngMango.directive:maMomentary
 *
 * @description Directive that provides functionality for a momentary button. Expressions can be executed when the user
 * presses a mouse button down and releases it. Can also execute an expression on an interval for the
 * duration that the mouse button is held down. Useful for 'jogging' motors.
 *
 * @param {expression=} ma-momentary-start Expression which is executed when the mouse is pressed down
 * @param {expression=} ma-momentary-end Expression which is executed when the mouse is released or the cursor moves off the element
 * @param {expression=} ma-momentary Expression which is executed on an interval while the mouse is held down. ma-momentary-interval must
 *     be set to a positive number for this expression to fire.
 * @param {number=} ma-momentary-interval The interval in ms at which to the ma-momentary expression is executed
 *
 **/

momentaryDirective.$inject = ['$interval'];
function momentaryDirective($interval) {

    class MomentaryController {
        static get $$ngIsClass() { return true; }
        static get $inject() { return ['$element', '$scope']; }
        
        constructor($element, $scope) {
            this.$element = $element;
            this.$scope = $scope;
            
            const boundStart = event => {
                if (event.button === 0) {
                    $scope.$apply(() => {
                        this.momentaryStart(event);
                    });
                }
            };
            
            const boundEnd = event => {
                $scope.$apply(() => {
                    this.momentaryEnd(event);
                });
            };
            
            $element.on('mousedown', boundStart);
            $element.on('mouseup', boundEnd);
            $element.on('mouseleave', boundEnd);
            
            this.active = false;
        }
        
        momentaryStart(event) {
            this.cancelInterval(); // cancel existing interval just in case

            this.active = true;
            
            if (isFinite(this.maMomentaryInterval) && this.maMomentaryInterval > 0) {
                this.intervalPromise = $interval(() => {
                    this.$scope.$apply(() => {
                        this.intervalFired();
                    });
                }, this.maMomentaryInterval, 0, false);
            }
            
            if (this.maMomentaryStart) {
                this.maMomentaryStart();
            }
            if (this.maMomentary) {
                this.maMomentary({$start: true});
            }
        }
        
        momentaryEnd(event) {
            this.cancelInterval();
            
            const wasActive = this.active;
            this.active = false;
            
            if (wasActive && this.maMomentaryEnd) {
                this.maMomentaryEnd();
            }
        }
        
        cancelInterval() {
            if (this.intervalPromise) {
                $interval.cancel(this.intervalPromise);
                delete this.intervalPromise;
            }
        }
        
        intervalFired() {
            if (this.maMomentary) {
                this.maMomentary({$start: false});
            }
        }
    }
    
    return {
        restrict: 'A',
        require: {},
        scope: false,
        bindToController: {
            maMomentaryInterval: '<?',
            maMomentaryStart: '&?',
            maMomentary: '&?',
            maMomentaryEnd: '&?'
        },
        controller: MomentaryController
    };
}

export default momentaryDirective;
