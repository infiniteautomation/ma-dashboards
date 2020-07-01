/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
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
            return values.filter(v => !filter || v.toLowerCase().includes(filter.toLowerCase())).sort();
        });
    }

    inputChanged() {
        if (this.selected !== this.addNewValue) {
            delete this.addNewValue;
        }
        this.ngModelCtrl.$setViewValue(this.selected);
    }

    filterChanged(filterText, inOptions) {
        if (this.editMode) {
            if (filterText === this.addNewValue) {
                return;
            }

            if (filterText && !inOptions) {
                this.addNewValue = filterText;
            } else {
                delete this.addNewValue;
            }
        }
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
