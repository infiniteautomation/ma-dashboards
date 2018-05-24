/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

jogDirective.$inject = ['$interval'];
function jogDirective($interval) {

    class JogController {
        static get $$ngIsClass() { return true; }
        static get $inject() { return ['$element', '$scope']; }
        
        constructor($element, $scope) {
            this.$element = $element;
            this.$scope = $scope;
            
            const boundStart = event => {
                if (event.button === 0) {
                    $scope.$apply(() => {
                        this.jogStart(event);
                    });
                }
            };
            
            const boundEnd = event => {
                $scope.$apply(() => {
                    this.jogEnd(event);
                });
            };
            
            $element.on('mousedown', boundStart);
            $element.on('mouseup', boundEnd);
            $element.on('mouseleave', boundEnd);
        }
        
        jogStart(event) {
            this.cancelInterval(); // cancel existing interval just in case

            if (this.maJogActive) {
                this.intervalPromise = $interval(() => {
                    this.$scope.$apply(() => {
                        this.intervalFired();
                    });
                }, this.maJogInterval || 500, 0, false);
            }
            
            if (this.maJogStart) {
                this.maJogStart();
            }
            if (this.maJogActive) {
                this.maJog({$start: true});
            }
        }
        
        jogEnd(event) {
            this.cancelInterval();
            if (this.maJogEnd) {
                this.maJogEnd();
            }
        }
        
        cancelInterval() {
            if (this.intervalPromise) {
                $interval.cancel(this.intervalPromise);
                delete this.intervalPromise;
            }
        }
        
        intervalFired() {
            this.maJogActive({$start: false});
        }
    }
    
    return {
        restrict: 'A',
        require: {},
        scope: false,
        bindToController: {
            maJogInterval: '<?',
            maJogStart: '&?',
            maJogActive: '&?',
            maJogEnd: '&?'
        },
        controller: JogController
    };
}

export default jogDirective;
