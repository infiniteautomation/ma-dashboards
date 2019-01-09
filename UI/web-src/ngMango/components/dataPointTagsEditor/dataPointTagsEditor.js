/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import dataPointTagsEditorTemplate from './dataPointTagsEditor.html';
import './dataPointTagsEditor.css';

class DataPointTagsEditorController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maDataPointTags']; }
    
    constructor(maDataPointTags, $timeout) {
        this.maDataPointTags = maDataPointTags;
        
        this.tags = {};
        this.updateExcludedTags();
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
    }
    
    $onChanges(changes) {
    }

    updateExcludedTags() {
        const tagKeys = Object.keys(this.tags);
        this.excludedTags = ['device', 'name', ...tagKeys];
    }
    
    render() {
        this.tags = Object.assign({}, this.ngModelCtrl.$viewValue);
        this.updateExcludedTags();
    }
    
    deleteTagKey(key) {
        delete this.tags[key];
        
        this.updateExcludedTags();
        this.setViewValue();
    }
    
    addTagKey(key) {
        // blurs the autocomplete so it's dropdown doesn't open again
        if (document.activeElement) {
            document.activeElement.blur();
        }
        
        this.newTagKey = null;
        if (this.tags.hasOwnProperty(key)) return;
        
        this.tags[key] = '';
        
        this.updateExcludedTags();
        this.setViewValue();
    }
    
    tagValueChanged(key) {
        this.setViewValue();
    }
    
    setViewValue() {
        this.ngModelCtrl.$setViewValue(Object.assign({}, this.tags));
    }
}

export default {
    template: dataPointTagsEditorTemplate,
    controller: DataPointTagsEditorController,
    bindings: {
    },
    require: {
        ngModelCtrl: 'ngModel'
    }
};
