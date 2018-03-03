/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import pageEditorTemplate from './pageEditor.html';
import angular from 'angular';

pageEditor.$inject = [];
function pageEditor() {
    return {
        scope: true,
        template: pageEditorTemplate,
        controller: PageEditorController,
        controllerAs: '$ctrl',
        bindToController: {}
    };
}

PageEditorController.$inject = [];
function PageEditorController() {
    this.showEditor = true;
    this.showPreview = true;
}

PageEditorController.prototype.markupChanged = function markupChanged(text) {
    if (text) {
        this.page.jsonData.markup = text;
    }
    this.page.$dirty = true;
};

export default pageEditor;


