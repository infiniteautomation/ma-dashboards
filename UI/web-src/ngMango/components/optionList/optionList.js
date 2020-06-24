/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import optionListTemplate from './optionList.html';
import './optionList.css';

class OptionListController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$element', '$scope', '$attrs', '$q', '$transclude', '$timeout', '$window']; }
    
    constructor($element, $scope, $attrs, $q, $transclude, $timeout, $window) {
        this.$element = $element;
        this.$scope = $scope;
        this.$attrs = $attrs;
        this.$q = $q;
        this.$transclude = $transclude;
        this.$timeout = $timeout;
        this.$window = $window;
        
        this.showFilter = true;
        this.$element[0].addEventListener('keydown', event => this.onKeyDown(event));
        this.$element[0].addEventListener('keypress', event => this.onKeyPress(event));
        this.options = [];
        this.selected = new Map();
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();

        this.multiple = this.$element[0].hasAttribute('multiple') || !!this.ngMultiple;
        this.updateMultipleAttribute();

        this.disabled = false;
        this.$attrs.$observe('disabled', (value) => {
            const disabled = typeof value === 'string' || !!value;
            if (this.disabled !== disabled) {
                this.disabled = disabled;
                this.setTabIndex();
            }
        });

        if (this.dropDownCtrl) {
            this.$scope.$on('maDropDownOpen', (event, dropDown, openedPromise) => {
                this.focusOnOption();
                delete this.filter;
                this.query();
            });
        } else {
            this.query();
        }

        const $parent = this.$element.maFind('.ma-option-list-container');
        this.$transclude((clone, scope) => {
            scope.$optionList = this;
            Object.defineProperties(scope, {
                $filter: {get: () => this.filter},
                $items: {get: () => this.items}
            });
            $parent.append(clone);
        }, $parent);
    }

    $onChanges(changes) {
        if (changes.reloadItems && !changes.reloadItems.isFirstChange()) {
            this.query();
        }
        if (changes.ngMultiple && !changes.ngMultiple.isFirstChange()) {
            this.multiple = !!this.ngMultiple;
            this.updateMultipleAttribute();
            this.render();
        }
    }

    render() {
        this.selected.clear();
        
        const viewValue = this.ngModelCtrl.$viewValue;
        if (this.multiple && Array.isArray(viewValue)) {
            for (const item of viewValue) {
                this.selected.set(this.itemId(item), item);
            }
        } else if (!this.multiple && viewValue !== undefined) {
            this.selected.set(this.itemId(viewValue), viewValue);
        }
        
        for (const optionCtrl of this.options) {
            optionCtrl.updateSelected();
        }
        this.setTabIndex();
    }
    
    select(item) {
        const id = this.itemId(item);
        
        if (!this.multiple) {
            this.selected.clear();
        }
        
        if (this.selected.has(id)) {
            this.selected.delete(id);
        } else {
            this.selected.set(id, item);
        }

        if (this.multiple) {
            this.ngModelCtrl.$setViewValue(Array.from(this.selected.values()));
        } else if (this.selected.size) {
            const [first] = this.selected.values();
            this.ngModelCtrl.$setViewValue(first);
        }

        if (!this.multiple && this.dropDownCtrl) {
            this.dropDownCtrl.close();
        }
        
        for (const optionCtrl of this.options) {
            optionCtrl.updateSelected();
        }
        this.setTabIndex();
    }
    
    isSelected(item) {
        return this.selected.has(this.itemId(item));
    }
    
    itemId(item) {
        if (item == null || typeof item !== 'object') {
            return item;
        }
        return typeof this.userItemId === 'function' ? this.userItemId({$item: item}) : (item.xid || item.id);
    }
    
    clearFilter() {
        delete this.filter;
        this.$element.maFind('[name=filter]').maFocus();
        this.query();
    }
    
    query() {
        if (typeof this.getItems !== 'function') return;
        
        const items = this.getItems({$filter: this.filter});

        const promise = this.queryPromise = this.$q.when(items).then(items => {
            if (promise === this.queryPromise) {
                this.items = items;
            }
        }).finally(() => {
            if (promise === this.queryPromise) {
                delete this.queryPromise;
            }
        });
        
        return promise;
    }
    
    onKeyDown(event) {
        const $target = angular.element(event.target);
        if (this.showFilter && event.getModifierState('Control') && event.key === 'f') {
            // focus on the filter input on Ctrl-F
            event.stopPropagation();
            event.preventDefault();
            this.$element.maFind('[name=filter]').maFocus({selectText: true});
        } else if (event.key === 'ArrowUp') {
            event.stopPropagation();
            event.preventDefault();
            $target.maPrev('[role=option]:not([disabled])').maFocus();
        } else if (event.key === 'ArrowDown') {
            event.stopPropagation();
            event.preventDefault();
            
            // if we are currently focused on an option, select the next option, otherwise select the first option
            if ($target.maMatch('[role=option]').length) {
                $target.maNext('[role=option]:not([disabled])').maFocus();
            } else {
                this.$element.maFind('[role=option]:not([disabled])').maFocus();
            }
        } else if (event.key === 'Tab') {
            // close the drop down on tab
            if (this.dropDownCtrl) {
                event.stopPropagation();
                event.preventDefault();
                this.$scope.$apply(() => {
                    this.dropDownCtrl.close();
                });
            }
        }
    }
    
    /**
     * Jumps to a spot in the list by searching the text content of the options.
     */
    onKeyPress(event) {
        if (event.key.length > 1 || event.target.matches('input[name=filter]') ||
                event.getModifierState('Control') || event.getModifierState('Alt') || event.getModifierState('Meta') || event.getModifierState('OS')) {
            return;
        }
        event.preventDefault();
        
        this.searchText = (this.searchText || '') + event.key.toLowerCase();
        this.$timeout.cancel(this.clearSearchText);
        this.clearSearchText = this.$timeout(() => delete this.searchText, 500);
        
        const options = this.$element[0].querySelectorAll('[role=option]:not([disabled])');
        const match = Array.from(options).find(o => o.textContent.trim().toLowerCase().startsWith(this.searchText));
        if (match) {
            match.focus();
        }
    }
    
    firstOption() {
        // prefer the first selected option
        return this.$element[0].querySelector('[role=option]:not([disabled]).ma-selected') || this.$element[0].querySelector('[role=option]:not([disabled])');
    }

    focusOnOption() {
        const option = this.firstOption();
        if (option) {
            option.focus();
            //option.scrollIntoView({block: 'center'});
        }
    }

    addOption(optionCtrl) {
        this.options.push(optionCtrl);
        
        // this is done whenever the value changes inside the option
        //this.setTabIndex();
    }
    
    removeOption(optionCtrl) {
        this.options.splice(this.options.indexOf(optionCtrl), 1);
        this.setTabIndex();
    }
    
    setTabIndex() {
        if (this.setTabIndexPromise) {
            return this.setTabIndexPromise;
        }

        this.setTabIndexPromise = new this.$q(resolve => {
            this.$window.requestAnimationFrame(() => {
                // clear the current tab option
                if (this.tabOption) {
                    this.tabOption.setAttribute('tabindex', '-1');
                    delete this.tabOption;
                }

                // ensure that you can always tab to an option (but only one)
                const tabOption = !this.disabled && this.firstOption();
                if (tabOption) {
                    this.tabOption = tabOption;
                    this.tabOption.setAttribute('tabindex', '0');
                }

                this.focusOnOption();

                delete this.setTabIndexPromise;
                resolve();
            });
        });

        return this.setTabIndexPromise;
    }
    
    updateMultipleAttribute() {
        if (this.multiple) {
            this.$element[0].setAttribute('multiple', 'multiple');
        } else {
            this.$element[0].removeAttribute('multiple');
        }
    }
}

export default {
    template: optionListTemplate,
    controller: OptionListController,
    bindings: {
        getItems: '&?items',
        reloadItems: '<?',
        userItemId: '&?itemId',
        showFilter: '<?',
        ngMultiple: '<?'
    },
    require: {
        ngModelCtrl: 'ngModel',
        dropDownCtrl: '?^^maDropDown'
    },
    transclude: true
};