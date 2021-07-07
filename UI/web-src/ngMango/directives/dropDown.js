/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

/**
 * @ngdoc directive
 * @name ngMango.directive:maDropDown
 * @restrict E
 * @description
 */

import './dropDown.css';

dropDown.$inject = ['$document', '$animate', '$window'];
function dropDown($document, $animate, $window) {
    
    const $body = $document.maFind('body');

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
            this.autoFocus = true;
            this.keydownListener = this.keydownListener.bind(this);
            this.scrollListener = this.scrollListener.bind(this);
            this.focusListener = this.focusListener.bind(this);
            this.resizeListener = this.resizeListener.bind(this);

            this.fullscreenMedia = '(max-height: 449px), (max-width: 599px)';
        }
        
        $onChanges(changes) {
            if (changes.openOptions && !changes.openOptions.isFirstChange() && this.openOptions) {
                if (this.openOptions.toggle) {
                    this.toggleOpen(this.openOptions);
                } else {
                    this.open(this.openOptions);
                }
            }
        }
        
        $onInit() {
            $body[0].addEventListener('focus', this.focusListener, true);
            $window.addEventListener('resize', this.resizeListener, true);
            $window.addEventListener('scroll', this.scrollListener, true);

            // listen for the when a parent ma-dialog component is removed from the DOM
            this.$scope.$on('maDialogRemoving', () => this.close());

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
        
        $onDestroy() {
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
            this.$backdrop = angular.element('<div class="ma-drop-down-backdrop" tabindex="0"></div>');
            this.$backdrop[0].addEventListener('focus', () => {
                this.$scope.$apply(() => this.close());
            });

            this.$dropDown = this.$transclude((tClone, tScope) => {
                tScope.$dropDown = this;
                this.transcludeScope = tScope;
                
                // we could allow the drop down contents to find controllers from the parents
                //this.$element.after(tClone);
            }, $body);
            
            // detach the drop down contents
            //this.$dropDown.detach();
            
            this.$dropDown[0].addEventListener('keydown', this.keydownListener);
        }
        
        destroyElement() {
            if (this.$dropDown) {
                this.$dropDown.remove();
                delete this.$dropDown;
            }
            if (this.$backdrop) {
                this.$backdrop.remove();
                delete this.$backdrop;
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

                $body.append(this.$backdrop);
                $body.append(this.$dropDown);
                
                // trigger any virtual repeat directives to scroll back to the top
                dropDownEl.querySelectorAll('.md-virtual-repeat-scroller').forEach(e => {
                    e.scroll(0, 0);
                    e.dispatchEvent(new CustomEvent('scroll'));
                });

                this.openAnimation = $animate.addClass(this.$dropDown, 'ma-open');
                this.onOpen({$dropDown: this});
                this.transcludeScope.$broadcast('maDropDownOpen', this, this.openAnimation);
                
                this.openAnimation.then(() => {
                    if (this.autoFocus) {
                        this.focus();
                    }
                    this.onOpened({$dropDown: this});
                    this.transcludeScope.$broadcast('maDropDownOpened', this);
                }, error => {
                    // cancelled, dont care
                });
            }
        }
        
        close() {
            if (this.isOpen()) {
                this.cancelAnimations();
                
                // cant use $animate.leave as it removes the element (instead of detach), destroying its event handlers
                this.closeAnimation = $animate.removeClass(this.$dropDown, 'ma-open');
                this.onClose({$dropDown: this});
                this.transcludeScope.$broadcast('maDropDownClose', this, this.closeAnimation);

                // transfer focus back to the target element that opened the drop down (usually a ma-drop-down-button)
                if (this.hasFocus() && this.targetElement) {
                    this.targetElement.focus();
                }
                
                this.closeAnimation.then(() => {
                    const tScope = this.transcludeScope;
                    if (this.destroyOnClose) {
                        this.destroyElement();
                    } else {
                        this.$dropDown.detach();
                        this.$backdrop.detach();
                    }
                    tScope.$broadcast('maDropDownClosed', this);
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

            const dropDownEl = this.$dropDown[0];
            const backdropEl = this.$backdrop[0];
            const style = {
                width: '',
                height: '',
                maxHeight: '',
                top: '',
                right: '',
                bottom: '',
                left: '',
                transformOrigin: ''
            };
            
            this.fullscreen = $window.matchMedia(this.fullscreenMedia).matches;
            if (this.fullscreen) {
                backdropEl.classList.add('ma-full-screen');
                dropDownEl.classList.add('ma-full-screen');
            } else {
                backdropEl.classList.remove('ma-full-screen');
                dropDownEl.classList.remove('ma-full-screen');

                const rect = this.targetElement.getBoundingClientRect();
                const spaceAbove = rect.top;
                const spaceBelow = $window.innerHeight - rect.bottom;

                if (dropDownEl.classList.contains('ma-fixed-width-left')) {
                    style.right = `${$window.innerWidth - rect.right}px`;
                } else if (dropDownEl.classList.contains('ma-fixed-width-right')) {
                    style.left = `${rect.left}px`;
                } else {
                    style.left = `${rect.left}px`;
                    style.width = `${rect.width}px`;
                }

                if (spaceBelow > spaceAbove) {
                    style.top = `${spaceAbove + rect.height}px`;
                    style.maxHeight = `${spaceBelow - 8}px`;
                } else {
                    style.bottom = `${spaceBelow + rect.height}px`;
                    style.maxHeight = `${spaceAbove - 8}px`;
                    style.transformOrigin = '0 100%';
                }
            }

            Object.assign(dropDownEl.style, style);
        }

        hasFocus(activeElement = $document[0].activeElement) {
            return this.$dropDown[0].contains(activeElement) ||
                this.$backdrop[0].contains(activeElement) ||
                this.targetElement.contains(activeElement) ||
                this.menuHasFocus(activeElement);
        }

        menuHasFocus(activeElement) {
            return Array.prototype.some.call($document[0].querySelectorAll('.md-open-menu-container'),
                    e => e.contains(activeElement));
        }

        /**
         * This listens for focus events on the body element.
         * @param event
         */
        focusListener(event) {
            if (this.isOpen() && !this.hasFocus(event.target)) {
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
                this.resizeDropDown();
            }
        }

        focus() {
            this.$dropDown.maFind('[autofocus], button, [href], input, select, textarea, [tabindex]')
                .maFocus({sort: true});
        }
        
        keydownListener(event) {
            if (event.key === 'Escape' && this.isOpen()) {
                event.stopPropagation();
                this.$scope.$apply(() => {
                    this.close();
                });
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
            onClosed: '&',
            autoFocus: '<?',
            fullscreenMedia: '@?fullscreen'
        },
        require: {
            dropDownButton: '?^^maDropDownButton',
            
            // allow access to input container and form from inside the drop down
            // (for those components which are aware of the drop down, e.g. ma-option-list)
            containerCtrl: '?^^mdInputContainer',
            formCtrl: '?^^form'
        }
    };
}

export default dropDown;