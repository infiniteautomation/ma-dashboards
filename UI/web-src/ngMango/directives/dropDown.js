/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

/**
 * @ngdoc directive
 * @name ngMango.directive:maDropDown
 * @restrict E
 * @description
 */

/*
 * TODO
 * Additional way to define other elements which maintain the focus
 * (better) Way to disable animation
 * Set height according to position of element
 * 
 * window resizing is not resizing the drop down correctly
 * toggle is not working correctly due to focus being incorrect
 */

import angular from 'angular';
import './dropDown.css';

dropDown.$inject = ['$parse', '$document', '$injector', '$animate', '$window'];
function dropDown($parse, $document, $injector, $animate, $window) {
    
    const $body = $document.maFind('body');
    const $mdColors = $injector.has('$mdColors') && $injector.get('$mdColors');

    class DropDownController {
        static get $$ngIsClass() { return true; }
        static get $inject() { return ['$scope', '$element', '$attrs', '$transclude']; }
        
        constructor($scope, $element, $attrs, $transclude) {
            this.$scope = $scope;
            this.$element = $element;
            this.$attrs = $attrs;
            this.$transclude = $transclude;
            
            this.createOnInit = true;
            this.destroyOnClose = false;
            this.scrollListener = this.scrollListener.bind(this);
            this.focusListener = this.focusListener.bind(this);
            this.resizeListener = this.resizeListener.bind(this);
        }
        
        $onChanges(changes) {
            if (changes.openOptions && !changes.openOptions.isFirstChange() && this.openOptions) {
                this.open(this.openOptions);
            }
        }
        
        $onInit() {
            $body[0].addEventListener('focus', this.focusListener, true);
            $window.addEventListener('resize', this.resizeListener, true);
            $window.addEventListener('scroll', this.scrollListener, true);

            if (this.createOnInit) {
                this.createElement();
            }
            
            if (this.openOptions) {
                this.open(this.openOptions);
            }
            
            if (this.dropDownButton) {
                this.dropDownButton.register(this);
            }
        }
        
        $destroy() {
            this.cancelAnimations();
            $body[0].removeEventListener('focus', this.focusListener, true);
            $window.removeEventListener('resize', this.resizeListener, true);
            $window.removeEventListener('scroll', this.scrollListener, true);
            
            this.destroyElement();
            
            if (this.dropDownButton) {
                this.dropDownButton.deregister(this);
            }
        }

        createElement() {
            this.$dropDown = this.$transclude((tClone, tScope) => {
                tScope.$dropDown = this;
                this.transcludeScope = tScope;
            }, $body);
            
            if ($mdColors && !this.$attrs.hasOwnProperty('mdColors')) {
                $mdColors.applyThemeColors(this.$dropDown, {background: 'background-hue-1'});
            }
        }
        
        destroyElement() {
            if (this.$dropDown) {
                this.$dropDown.remove();
                delete this.$dropDown;
            }
            if (this.transcludeScope) {
                this.transcludeScope.$destroy();
                delete this.transcludeScope;
            }
        }

        isOpen() {
            return !!this.openAnimation;
        }

        open(options = {}) {
            this.openOptions = options;
            
            if (!this.$dropDown) {
                this.createElement();
            }
            
            const dropDownEl = this.$dropDown[0];

            if (options.targetElement) {
                this.targetElement = options.targetElement;
            } else if (options.targetEvent) {
                this.targetElement = options.targetEvent.target;
            } else {
                this.targetElement = this.$element.parent()[0];
            }
            this.resizeDropDown();

            if (!this.isOpen()) {
                this.cancelAnimations();

                $body.append(this.$dropDown);
                
                // trigger any virtual repeat directives to scroll back to the top
                dropDownEl.querySelectorAll('.md-virtual-repeat-scroller').forEach(e => {
                    e.scroll(0, 0);
                    e.dispatchEvent(new CustomEvent('scroll'));
                });
                
                this.onOpen({$dropDown: this});
                this.transcludeScope.$broadcast('maDropDownOpen');
                
                this.openAnimation = $animate.addClass(this.$dropDown, 'ma-open');
                
                this.openAnimation.then(() => {
                    this.focus();
                    this.onOpened({$dropDown: this});
                    this.transcludeScope.$broadcast('maDropDownOpened');
                }, error => {
                    // cancelled, dont care
                });
            }
        }
        
        close() {
            if (this.isOpen()) {
                this.cancelAnimations();
                this.onClose({$dropDown: this});
                this.transcludeScope.$broadcast('maDropDownClose');

                // cant use $animate.leave as it removes the element (instead of detach), destroying its event handlers
                this.closeAnimation = $animate.removeClass(this.$dropDown, 'ma-open');
                
                this.closeAnimation.then(() => {
                    const tScope = this.transcludeScope;
                    if (this.destroyOnClose) {
                        this.destroyElement();
                    } else {
                        this.$dropDown.detach();
                    }
                    tScope.$broadcast('maDropDownClosed');
                    this.onClosed({$dropDown: this});
                }, error => {
                    // cancelled, dont care
                });
            }
        }
        
        toggleOpen(options) {
            if (this.isOpen()) {
                this.close();
            } else {
                this.open(options);
            }
        }
        
        cancelAnimations() {
            if (this.openAnimation) {
                $animate.cancel(this.openAnimation);
                delete this.openAnimation;
            }
            if (this.closeAnimation) {
                $animate.cancel(this.closeAnimation);
                delete this.closeAnimation;
            }
        }
        
        resizeDropDown() {
            if (!this.targetElement || !this.$dropDown) return;
            
            const rect = this.targetElement.getBoundingClientRect();
            const dropDownEl = this.$dropDown[0];

            dropDownEl.style.left = `${rect.left}px`;
            dropDownEl.style.width = `${rect.width}px`;
            
            const spaceAbove = rect.top;
            const spaceBelow = window.innerHeight - rect.bottom;
            if (spaceBelow > spaceAbove) {
                dropDownEl.style.top = `${spaceAbove + rect.height}px`;
                dropDownEl.style.bottom = null;
                dropDownEl.style.maxHeight = `${spaceBelow - 8}px`;
                dropDownEl.style.transformOrigin = '0 0';
            } else {
                dropDownEl.style.top = null;
                dropDownEl.style.bottom = `${spaceBelow + rect.height}px`;
                dropDownEl.style.maxHeight = `${spaceAbove - 8}px`;
                dropDownEl.style.transformOrigin = '0 100%';
            }
        }
        
        hasFocus() {
            return this.$dropDown.maHasFocus() || $body.maFind('.md-open-menu-container').maHasFocus() ||
                angular.element(this.targetElement).maHasFocus();
        }
        
        focusListener(event) {
            if (this.isOpen() && !this.hasFocus()) {
                // getting $digest already in progress errors due to AngularJS material triggering a focus event inside the $digest cycle
                if (this.$scope.$root.$$phase != null) {
                    this.close();
                } else {
                  this.$scope.$apply(() => {
                      this.close();
                  });
                }
            }
        }
        
        resizeListener(event) {
            clearTimeout(this.resizeDebounceTimeout);
            this.resizeDebounceTimeout = setTimeout(() => {
                this.resizeDropDown();
            }, 200);
        }
        
        scrollListener(event) {
            if (this.isOpen() && !this.$dropDown[0].contains(event.target)) {
                //this.resizeDropDown();
                this.$scope.$apply(() => {
                    this.close();
                });
            }
        }

        focus() {
            const autofocus = this.$dropDown.maFind('[autofocus]');
            if (autofocus.length) {
                autofocus[0].focus();
                return;
            }

            const focusable = this.$dropDown.maFind('button, [href], input, select, textarea, [tabindex]');
            const sorted = Array.from(focusable).filter(e => {
                // offsetParent is null if element is not visible
                return e.tabIndex >= 0 && e.offsetParent;
            }).sort((e1, e2) => {
                return e1.tabIndex - e2.tabIndex;
            });
            if (sorted.length) {
                sorted[0].focus();
                return;
            }
        }
    }

    return {
        scope: {},
        restrict: 'E',
        transclude: 'element',
        terminal: true,
        priority: 599, // 1 lower than ngIf
        controller: DropDownController,
        bindToController: {
            openOptions: '<openDropDown',
            createOnInit: '<?',
            destroyOnClose: '<?',
            onOpen: '&',
            onOpened: '&',
            onClose: '&',
            onClosed: '&'
        },
        require: {
            dropDownButton: '^?maDropDownButton'
        }
    };
}

export default dropDown;