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
    }
    
    $onInit() {
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
        }, $parent[0]);
    }
    
    $onChanges(changes) {
        if (changes.reloadItems && !changes.reloadItems.isFirstChange()) {
            this.query();
        }
    }

    render() {
        this.selected = this.ngModelCtrl.$viewValue;
    }
    
    select(item) {
        this.selected = item;
        this.ngModelCtrl.$setViewValue(this.itemId(this.selected));
        if (this.dropDownCtrl) {
            this.dropDownCtrl.close();
        }
    }
    
    isSelected(item) {
        return this.itemId(this.selected) === this.itemId(item);
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
    
    focusOnOption() {
        const option = this.$element[0].querySelector('[role=option].ma-selected') || this.$element[0].querySelector('[role=option]:not([disabled])');
        if (option) {
            option.focus();
            //option.scrollIntoView({block: 'center'});
        }
    }
}

export default {
    template: optionListTemplate,
    controller: OptionListController,
    bindings: {
        getItems: '&items',
        reloadItems: '<?',
        userItemId: '&?itemId',
        showFilter: '<?'
    },
    require: {
        ngModelCtrl: 'ngModel',
        dropDownCtrl: '?^^maDropDown'
    },
    transclude: true
};