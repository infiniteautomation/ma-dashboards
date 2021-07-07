/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import pageEditorTemplate from './pageEditor.html';

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


