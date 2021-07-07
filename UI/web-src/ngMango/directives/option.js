/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import './option.css';

optionDirective.$inject = ['$injector'];
function optionDirective($injector) {

    class OptionController {
        static get $$ngIsClass() { return true; }
        static get $inject() { return ['$scope', '$element', '$attrs']; }
        
        constructor($scope, $element, $attrs) {
            this.$scope = $scope;
            this.$element = $element;
            this.$attrs = $attrs;
            
            Object.defineProperty($scope, '$selected', {get: () => this.selected});
            Object.defineProperty($scope, '$multiple', {get: () => this.listCtrl && this.listCtrl.multiple});
            this.disabled = false;
        }
        
        $onInit() {
            this.$element.attr('role', 'option');
            this.$element.attr('tabindex', '-1');

            this.$attrs.$observe('disabled', (value) => {
                const disabled = typeof value === 'string' || !!value;
                if (this.disabled !== disabled) {
                    this.disabled = disabled;
                    this.listCtrl.setTabIndex();
                }
            });

            if ($injector.has('$mdButtonInkRipple')) {
                $injector.get('$mdButtonInkRipple').attach(this.$scope, this.$element);
            }

            if (this.$attrs.hasOwnProperty('ngValue')) {
                this.$scope.$watch(this.$attrs.ngValue, (currentValue, previousValue) => {
                    this.value = currentValue;
                    this.updateSelected();
                    this.listCtrl.setTabIndex();
                });
            } else if (this.$attrs.hasOwnProperty('value')) {
                this.value = this.$attrs.value;
                this.updateSelected();
                this.listCtrl.setTabIndex();
            }
            
            const listener = event => {
                if (event.type === 'click' || (event.type === 'keydown' && ['Enter', ' '].includes(event.key))) {
                    if (!this.disabled && !this.listCtrl.disabled) {
                        event.preventDefault();
                        this.$scope.$apply(() => {
                            this.listCtrl.select(this.value);
                        });
                    }
                }
            };
            
            this.$element[0].addEventListener('click', listener);
            this.$element[0].addEventListener('keydown', listener);
            
            this.listCtrl.addOption(this);
        }
        
        $onDestroy() {
            this.listCtrl.removeOption(this);
        }

        updateSelected() {
            this.selected = this.listCtrl.isSelected(this.value);
            this.$element.attr('aria-selected', String(this.selected));
            //this.$element.attr('autofocus', this.selected ? '' : null);
            this.$element.toggleClass('ma-selected', this.selected);
        }
    }

    return {
        restrict: 'E',
        scope: true,
        require: {
            listCtrl: '^^maOptionList'
        },
        controller: OptionController,
        bindToController: true,
        compile: function(tElem, tAttrs) {
            // stops the aria-checked attribute from being added
            tAttrs.ngAriaDisable = '';
        }
    };
}

export default optionDirective;
