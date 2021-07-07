/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import dataPointTagKeySelectTemplate from './dataPointTagKeySelect.html';
import './dataPointTagKeySelect.css';

/**
 * @ngdoc directive
 * @name ngMango.directive:maDataPointTagKeySelect
 * @restrict 'E'
 * @scope
 *
 * @description Displays a drop down list of tag keys.
 *
 * @param {expression} ng-model Assignable expression to output the selected tag key. Output will be a string.
 * 
 * @usage
 * <ma-data-point-tag-key-select ng-model="tagKey"></ma-data-point-tag-key-select>
 *
 **/

class DataPointTagKeySelectController {
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
        this.updateDisabledOptions();
        this.updateExcludeTags();
    }

    $onChanges(changes) {
        if (changes.editMode && !changes.editMode.isFirstChange()) {
            this.updatePlaceholder();
        }
        if (changes.disabledOptions && !changes.disabledOptions.isFirstChange()) {
            this.updateDisabledOptions();
        }
        if (changes.excludeTags && !changes.excludeTags.isFirstChange()) {
            this.updateExcludeTags();
        }
    }

    updatePlaceholder() {
        this.filterPlaceholder = this.maTranslate.trSync(this.editMode ? 'ui.components.filterOrAddTagKey' : 'ui.app.filter');
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
            this.queryPromise = this.maDataPointTags.keys();
            if (this.onQuery) {
                this.onQuery({$promise: this.queryPromise});
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

    updateExcludeTags() {
        this.excludeTagsMap = {};
        if (Array.isArray(this.excludeTags)) {
            for (const key of this.excludeTags) {
                this.excludeTagsMap[key] = true;
            }
        }
    }

    /**
     * Ensures all currently selected tags are available in the list when using edit mode.
     * @param {string[]} values
     * @returns {string[]}
     */
    addSelectedOptions(values) {
        const valueSet = new Set(values);
        if (this.multiple && Array.isArray(this.selected)) {
            this.selected.forEach(v => valueSet.add(v));
        } else if (!this.multiple && this.selected != null) {
            valueSet.add(this.selected)
        }
        return Array.from(valueSet);
    }
}

export default {
    bindings: {
        disabledOptions: '<?',
        multiple: '<?selectMultiple',
        selectedText: '<?',
        excludeTags: '<?',
        noFloat: '<?',
        onQuery: '&?',
        queryOnOpen: '<?',
        editMode: '<?',
        labelText: '@?',
        required: '<?ngRequired',
        disabled: '<?ngDisabled'
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    transclude: {
        label: '?maLabel'
    },
    template: dataPointTagKeySelectTemplate,
    controller: DataPointTagKeySelectController,
    designerInfo: {
        translation: 'ui.components.maDataPointTagKeySelect',
        icon: 'label'
    }
};
