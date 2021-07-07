/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import dataPointTagSelectTemplate from './dataPointTagSelect.html';
import './dataPointTagSelect.css';

/**
 * @ngdoc directive
 * @name ngMango.directive:maDataPointTagSelect
 * @restrict 'E'
 * @scope
 *
 * @description Displays a drop down list of tag values for a given key. You can set restrictions for other tag keys.
 *
 * @param {string} key The tag key to display available values for.
 * @param {object=} restrictions Restrictions for other tag keys. The object is a map of tag keys to tag values.
 * @param {boolean=} [select-multiple=false] Set to true in order to enable selecting multiple tag values.
 * 
 * @usage
 * <ma-data-point-tag-select ng-model="selectedTagValue" key="name" restrictions="{device: 'Device 1'}" select-multiple="true"></ma-data-point-tag-select>
 *
 **/

class DataPointTagSelectController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maDataPointTags', 'maTranslate']; }
    
    constructor(maDataPointTags, maTranslate) {
        this.maDataPointTags = maDataPointTags;
        this.maTranslate = maTranslate;
        this.queryOnOpen = true;
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => {
            this.selected = this.ngModelCtrl.$viewValue;
        };
        this.updatePlaceholder();
    }
    
    $onChanges(changes) {
        if (changes.key && !changes.key.isFirstChange() || changes.restrictions && !changes.restrictions.isFirstChange()) {
            delete this.queryPromise;

            if (this.dropDownOpen) {
                this.reloadItems = {};
            }
        }

        if (changes.editMode && !changes.editMode.isFirstChange()) {
            this.updatePlaceholder();
        }
        if (changes.disabledOptions && !changes.disabledOptions.isFirstChange()) {
            this.updateDisabledOptions();
        }
    }

    updatePlaceholder() {
        this.filterPlaceholder = this.maTranslate.trSync(this.editMode ? 'ui.components.filterOrAddTagValue' : 'ui.app.filter');
    }

    onOpen() {
        this.dropDownOpen = true;
    }

    onClose() {
        this.dropDownOpen = false;

        // delete the query promise so the API request is issued on next open
        if (this.queryOnOpen) {
            delete this.queryPromise;
        }
    }

    doQuery(filter) {
        if (!this.queryPromise) {
            const restrictions = Object.assign({}, this.restrictions);
            delete restrictions[this.key];

            this.queryPromise = this.maDataPointTags.values(this.key, restrictions);
            if (this.onQuery) {
                this.onQuery({$promise: this.queryPromise, $restrictions: restrictions});
            }
        }

        return this.queryPromise.then(values => {
            if (this.editMode) {
                values = this.addSelectedOptions(values);
                if (filter && !values.includes(filter)) {
                    this.addNewValue = filter;
                } else {
                    delete this.addNewValue;
                }
            }

            return values
                .filter(v => !filter || typeof v === 'string' && v.toLowerCase().includes(filter.toLowerCase()))
                .sort();
        });
    }
    
    inputChanged() {
        this.ngModelCtrl.$setViewValue(this.selected);
    }

    updateDisabledOptions() {
        this.disabledOptionsMap = {};
        if (Array.isArray(this.disabledOptions)) {
            for (const key of this.disabledOptions) {
                this.disabledOptionsMap[key] = true;
            }
        }
    }

    /**
     * Ensures all currently selected tag values are available in the list when using edit mode.
     * @param {string[]} values
     * @returns {string[]}
     */
    addSelectedOptions(values) {
        const valueSet = new Set(values);
        if (this.multiple && Array.isArray(this.selected)) {
            this.selected.forEach(v => valueSet.add(v));
        } else if (!this.multiple && this.selected !== undefined) {
            valueSet.add(this.selected)
        }
        return Array.from(valueSet);
    }
}

export default {
    bindings: {
        key: '@',
        restrictions: '<?',
        multiple: '<?selectMultiple',
        selectedText: '<?',
        noFloat: '<?',
        onQuery: '&?',
        required: '<?ngRequired',
        queryOnOpen: '<?',
        editMode: '<?',
        disabled: '<?ngDisabled',
        disabledOptions: '<?'
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    transclude: {
        label: '?maLabel'
    },
    template: dataPointTagSelectTemplate,
    controller: DataPointTagSelectController,
    designerInfo: {
        translation: 'ui.components.maDataPointTagSelect',
        icon: 'label',
        attributes: {
            key: {options: ['name', 'device']},
        }
    }
};
