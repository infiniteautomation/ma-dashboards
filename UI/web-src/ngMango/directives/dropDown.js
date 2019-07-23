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
 * Position above / below depending on position of element
 * Set height according to position of element
 * Add input button with blue line styling
 */

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
            this.focusListener = this.focusListener.bind(this);
            this.resizeListener = this.resizeListener.bind(this);
        }
        
        $onChanges(changes) {
            if (changes.openOptions && !changes.openOptions.isFirstChange() && this.openOptions) {
                this.open();
            }
        }
        
        $onInit() {
            $body[0].addEventListener('focus', this.focusListener, true);
            $window.addEventListener('resize', this.resizeListener, true);

            if (this.createOnInit) {
                this.createElement();
            }
            
            if (this.openOptions) {
                this.open();
            }
        }
        
        $destroy() {
            $body[0].removeEventListener('focus', this.focusListener, true);
            $window.removeEventListener('resize', this.resizeListener, true);
            this.destroyElement();
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
            return !!this.$dropDown && !!this.$dropDown.parent().length;
        }

        open() {
            const options = Object.assign({}, this.openOptions);
            
            if (!this.$dropDown) {
                this.createElement();
            }
            
            const dropDownEl = this.$dropDown[0];

            let targetElement;
            if (options.targetElement) {
                targetElement = options.targetElement;
            } else if (options.targetEvent) {
                targetElement = options.targetEvent.target;
            } else {
                targetElement = this.$element.parent()[0];
            }
            
            const rect = targetElement.getBoundingClientRect();
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
            console.log(spaceAbove, spaceBelow);
            
            if (!this.isOpen()) {
                $body.append(this.$dropDown);
                
                // trigger any virtual repeat directives to scroll back to the top
                dropDownEl.querySelectorAll('.md-virtual-repeat-scroller').forEach(e => {
                    e.scroll(0, 0);
                    e.dispatchEvent(new CustomEvent('scroll'));
                });
                
                this.onOpen({$dropDown: this});
                
                $animate.addClass(this.$dropDown, 'ma-open').then(() => {
                    this.focus();
                    this.onOpened({$dropDown: this});
                });
            }
        }
        
        close() {
            if (this.isOpen()) {
                this.onClose({$dropDown: this});
                
                // cant use $animate.leave as it removes the element (instead of detach), destroying its event handlers
                $animate.removeClass(this.$dropDown, 'ma-open').then(() => {
                    if (this.destroyOnClose) {
                        this.destroyElement();
                    } else {
                        this.$dropDown.detach();
                    }
                    this.onClosed({$dropDown: this});
                });
            }
        }
        
        focusListener(event) {
            if (this.isOpen() && !(this.$dropDown.maHasFocus() || $body.find('md-menu-content').maHasFocus())) {
                this.$scope.$apply(() => {
                    this.close();
                });
            }
        }
        
        resizeListener(event) {
            if (this.isOpen()) {
                this.open();
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
        }
    };
}

export default dropDown;