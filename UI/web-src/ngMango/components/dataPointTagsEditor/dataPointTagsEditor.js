/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import dataPointTagsEditorTemplate from './dataPointTagsEditor.html';
import './dataPointTagsEditor.css';

class DataPointTagsEditorController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maDataPointTags']; }
    
    constructor(maDataPointTags) {
        this.maDataPointTags = maDataPointTags;
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
    }
    
    $onChanges(changes) {
    }

    render() {
        this.tags = Object.assign({}, this.ngModelCtrl.$viewValue);
    }
    
    deleteTagKey(key) {
        delete this.tags[key];
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
