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
 * Promise callbacks for show/hide
 * Position above / below depending on position of element
 * Set height according to position of element
 */

import './dropDown.css';

dropDown.$inject = ['$parse', '$document', '$injector', '$animate'];
function dropDown($parse, $document, $injector, $animate) {
    
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
        }
        
        $onChanges(changes) {
            if (changes.openOptions && !changes.openOptions.isFirstChange() && this.openOptions) {
                this.open(this.openOptions);
            }
        }
        
        $onInit() {
            $body[0].addEventListener('focus', this.focusListener, true);

            if (this.createOnInit) {
                this.createElement();
            }
            
            if (this.openOptions) {
                this.open(this.openOptions);
            }
        }
        
        $destroy() {
            $body[0].removeEventListener('focus', this.focusListener, true);
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

        open(options = {}) {
            if (!this.$dropDown) {
                this.createElement();
            }
            
            const dropDownEl = this.$dropDown[0];

            // trigger any virtual repeat directives to scroll back to the top
            dropDownEl.querySelectorAll('.md-virtual-repeat-scroller').forEach(e => {
                e.scroll(0, 0);
                e.dispatchEvent(new CustomEvent('scroll'));
            });

            let targetElement;
            if (options.targetElement) {
                targetElement = options.targetElement;
            } else if (options.targetEvent) {
                targetElement = options.targetEvent.target;
            } else {
                targetElement = this.$element.parent()[0];
            }
            
            const rect = targetElement.getBoundingClientRect();
            dropDownEl.style.top = `${rect.top + rect.height}px`;
            dropDownEl.style.left = `${rect.left}px`;
            dropDownEl.style.width = `${rect.width}px`;
            
            if (!this.$dropDown.parent().length) {
                $body.append(this.$dropDown);
                $animate.addClass(this.$dropDown, 'ma-open');
            }
        }
        
        close() {
            if (this.destroyOnClose) {
                this.destroyElement();
            } else {
                // cant use $animate.leave as it removes the element (instead of detach), destroying its event handlers
                $animate.removeClass(this.$dropDown, 'ma-open').then(() => {
                    this.$dropDown.detach();
                });
            }
        }
        
        focusListener(event) {
            if (this.$dropDown && this.$dropDown.parent().length) {
                if (!(this.$dropDown.maHasFocus() || $body.find('md-menu-content').maHasFocus())) {
                    this.$scope.$apply(() => {
                        this.close();
                    });
                }
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
            destroyOnClose: '<?'
        }
    };
}

export default dropDown;