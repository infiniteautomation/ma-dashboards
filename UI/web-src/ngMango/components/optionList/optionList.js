/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import optionListTemplate from './optionList.html';
import './optionList.css';

class OptionListController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$element', '$scope', '$q', '$timeout']; }
    
    constructor($element, $scope, $q, $timeout) {
        this.$element = $element;
        this.$scope = $scope;
        this.$q = $q;
        this.showFilter = true;
        this.idCache = new WeakMap();
        this.$timeout = $timeout;
        
        this.$element[0].addEventListener('keydown', event => this.keyDown(event));
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
        if (this.dropDownCtrl) {
            this.$scope.$on('maDropDownOpen', (event, dropDown) => {
                delete this.filter;
                this.query().then(() => {
                    this.$timeout(() => dropDown.focus());
                });
            });
        } else {
            this.query();
        }
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
        if (this.idCache.has(item)) {
            return this.idCache.get(item);
        }
        const id = typeof this.userItemId === 'function' ? this.userItemId({$item: item}) : (item.xid || item.id);
        this.idCache.set(item, id);
        return id;
    }
    
    clearFilter() {
        delete this.filter;
        this.$element[0].querySelector('[name=filter]').focus();
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
    }
};