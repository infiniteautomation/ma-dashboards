/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import optionListTemplate from './optionList.html';
import './optionList.css';

class OptionListController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$element', '$scope', '$q', '$transclude']; }
    
    constructor($element, $scope, $q, $transclude) {
        this.$element = $element;
        this.$scope = $scope;
        this.$q = $q;
        this.$transclude = $transclude;
        
        this.showFilter = true;
        this.$element[0].addEventListener('keydown', event => this.keyDown(event));
        this.options = [];
        this.selected = new Map();
    }
    
    $onInit() {
        this.configureInputContainer();
        
        this.ngModelCtrl.$render = () => this.render();
        if (this.dropDownCtrl) {
            this.$scope.$on('maDropDownOpen', (event, dropDown, openedPromise) => {
                delete this.filter;

                this.$q.all([this.query(), openedPromise]).then(() => {
                    this.focusOnOption();
                });
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
        
        this.multiple = this.$element[0].hasAttribute('multiple');
    }

    $onChanges(changes) {
        if (changes.reloadItems && !changes.reloadItems.isFirstChange()) {
            this.query();
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

        if (this.dropDownCtrl) {
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
    
    keyDown(event) {
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
    
    firstOption() {
        // prefer the first selected option
        return this.$element[0].querySelector('[role=option].ma-selected') || this.$element[0].querySelector('[role=option]:not([disabled])');
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
        // ensure that you can always tab to an option (but only one)
        const tabOption = this.firstOption();
        if (tabOption && tabOption !== this.tabOption) {
            if (this.tabOption) {
                this.tabOption.setAttribute('tabindex', '-1');
            }
            this.tabOption = tabOption;
            this.tabOption.setAttribute('tabindex', '0');
        }
    }
    
    configureInputContainer() {
        const ngModelCtrl = this.ngModelCtrl;
        if (this.dropDownCtrl) {
            const form = this.dropDownCtrl.formCtrl;
            if (form) {
                form.$addControl(ngModelCtrl);
            }
        }
        const parentForm = ngModelCtrl.$$parentForm;
        
        const containerCtrl = this.containerCtrl || this.dropDownCtrl && this.dropDownCtrl.containerCtrl;
        if (containerCtrl) {
            const isErrorGetter = () => ngModelCtrl.$invalid && (ngModelCtrl.$touched || (parentForm && parentForm.$submitted));
            this.$scope.$watch(isErrorGetter, containerCtrl.setInvalid);
            
            if (!this.dropDownCtrl) {
                $element[0].addEventListener('focus', event => containerCtrl.setFocused(true));
                $element[0].addEventListener('blur', event => containerCtrl.setFocused(false));
            }
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
        showFilter: '<?'
    },
    require: {
        ngModelCtrl: 'ngModel',
        dropDownCtrl: '?^^maDropDown',
        containerCtrl: '?^^mdInputContainer'
    },
    transclude: true
};