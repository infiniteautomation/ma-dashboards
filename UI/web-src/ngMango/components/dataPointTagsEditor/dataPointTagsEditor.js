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
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
    }

    updateTagKeys() {
        this.tagKeys = Object.keys(this.tags);
    }
    
    render() {
        this.tags = Object.assign({}, this.ngModelCtrl.$viewValue);
        this.updateTagKeys();
    }
    
    deleteTagKey(key) {
        delete this.tags[key];
        this.updateTagKeys();
        this.setViewValue();
    }
    
    tagKeysChanged() {
        // add selected tag keys into the tags object
        for (const key of this.tagKeys) {
            if (!this.tags.hasOwnProperty(key)) {
                this.tags[key] = undefined;
            }
        }

        // remove deselected tag keys from the tags object
        for (const key of Object.keys(this.tags)) {
            if (!this.tagKeys.includes(key)) {
                delete this.tags[key];
            }
        }

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
    require: {
        ngModelCtrl: 'ngModel'
    }
};
