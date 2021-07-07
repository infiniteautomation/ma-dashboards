/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import angular from 'angular';
import optionListTemplate from './optionList.html';
import './optionList.css';

class OptionListController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$element', '$scope', '$attrs', '$q', '$transclude', '$timeout', '$window', 'maTranslate']; }
    
    constructor($element, $scope, $attrs, $q, $transclude, $timeout, $window, maTranslate) {
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
        this.queryOnOpen = true;

        // option list is used on register page, need public translation
        this.filterPlaceholder = maTranslate.trSync('login.ui.filter');
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
                // selected option may already be present, focus on it
                const option = this.firstOption();
                if (option) {
                    option.focus();
                }

                if (this.queryOnOpen) {
                    const filterChanged = !!this.filter;
                    delete this.filter;
                    this.query({$dropDownOpen: true, $filterChanged: filterChanged}).then(() => {
                        this.setTabIndexFocus = true;
                        this.setTabIndex();
                    });
                }
            });
        }

        // do query on init by default if there is no drop down
        if (this.hasOwnProperty('queryOnInit') ? this.queryOnInit : !this.dropDownCtrl) {
            this.query({$onInit: true});
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
            this.query({$reload: true});
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
        } else if (!this.multiple) {
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
            if (this.multiple) {
                // changing the value can cause the layout to be affected, e.g. tag editor inside the data point edit
                // dialog. Resize the drop down to ensure it remains below the input.
                this.$timeout(() => {
                    this.dropDownCtrl.resizeDropDown();
                });
            } else {
                this.dropDownCtrl.close();
            }
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
        this.filterChanged();
    }

    query(options) {
        if (typeof this.getItems !== 'function') return;

        const items = this.getItems(Object.assign({$filter: this.filter}, options));

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

    loadMore() {
        this.query({$loadMore: true});
    }

    onKeyDown(event) {
        if (this.showFilter && event.key === 'f' && event.getModifierState('Control')) {
            // focus on the filter input on Ctrl-F
            event.stopPropagation();
            event.preventDefault();

            const filter = this.$element[0].querySelector('[name=filter]');
            if (filter) {
                filter.focus();
                filter.setSelectionRange(0, filter.value.length);
            }
        } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.stopPropagation();
            event.preventDefault();

            const options = this.$element[0].querySelectorAll('[role=option]:not([disabled])');
            const currentIndex = Array.prototype.indexOf.call(options, event.target);

            let nextOption;
            if (event.key === 'ArrowUp') {
                nextOption = options[currentIndex - 1] || options[options.length - 1];
            } else {
                nextOption = options[currentIndex + 1] || options[0];
            }

            if (nextOption) {
                nextOption.focus();
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
        if (!event.key || event.key.length > 1 || event.target.matches('input[name=filter]') ||
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
        return this.$element[0].querySelector('[role=option]:not([disabled]).ma-selected') ||
            this.$element[0].querySelector('[role=option]:not([disabled])');
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
        if (this.setTabIndexScheduled) {
            return;
        }
        this.setTabIndexScheduled = true;
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

                if (this.setTabIndexFocus) {
                    this.tabOption.focus();
                }
            }

            delete this.setTabIndexScheduled;
            delete this.setTabIndexFocus;
        });
    }
    
    updateMultipleAttribute() {
        if (this.multiple) {
            this.$element[0].setAttribute('multiple', 'multiple');
        } else {
            this.$element[0].removeAttribute('multiple');
        }
    }

    filterChanged() {
        this.query({$filterChanged: true});
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
        ngMultiple: '<?',
        queryOnInit: '<?',
        queryOnOpen: '<?',
        filterPlaceholder: '@?'
    },
    require: {
        ngModelCtrl: 'ngModel',
        dropDownCtrl: '?^^maDropDown'
    },
    transclude: true
};