/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
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
        }
        
        $onInit() {
            this.$element.attr('role', 'option');
            this.$element.attr('tabindex', '-1');

            if ($injector.has('$mdButtonInkRipple')) {
                $injector.get('$mdButtonInkRipple').attach(this.$scope, this.$element);
            }

            if (this.$attrs.hasOwnProperty('ngValue')) {
                this.$scope.$watch(this.$attrs.ngValue, currentValue => {
                    this.value = currentValue;
                });
            } else if (this.$attrs.hasOwnProperty('value')) {
                this.value = this.$attrs.value;
            }
            
            const listener = event => {
                if (event.type === 'click' || (event.type === 'keydown' && ['Enter', ' '].includes(event.key))) {
                    event.preventDefault();
                    this.$scope.$apply(() => {
                        this.listCtrl.select(this.value);
                    });
                }
            };
            
            this.$element[0].addEventListener('click', listener);
            this.$element[0].addEventListener('keydown', listener);
            
            this.listCtrl.addOption(this);
        }
        
        $onDestroy() {
            this.listCtrl.removeOption(this);
        }
        
        $doCheck() {
            this.selected = this.listCtrl.isSelected(this.value);
            if (this.prevSelected !== this.selected) {
                this.selectedChanged();
                this.prevSelected = this.selected;
            }
        }
        
        selectedChanged() {
            this.$element.attr('aria-selected', String(this.selected));
            //this.$element.attr('autofocus', this.selected ? '' : null);
            this.$element.toggleClass('ma-selected', this.selected);
            this.listCtrl.setTabIndex();
        }
    }

    return {
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
