/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
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
        this.showAnyOption = false;
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
            this.reloadItems = {};
            delete this.queryPromise;
        }

        if (changes.editMode && !changes.editMode.isFirstChange()) {
            this.updatePlaceholder();
        }
    }

    updatePlaceholder() {
        this.filterPlaceholder = this.maTranslate.trSync(this.editMode ? 'ui.components.filterOrAddTagValue' : 'ui.app.filter');
    }

    dropDownOpen() {
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
}

export default {
    bindings: {
        key: '@',
        restrictions: '<?',
        multiple: '<?selectMultiple',
        selectedText: '<?',
        noFloat: '<?',
        onQuery: '&?',
        showAnyOption: '<?',
        queryOnOpen: '<?',
        editMode: '<?',
        disabled: '<?ngDisabled'
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
