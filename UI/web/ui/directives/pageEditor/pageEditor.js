/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require', 'angular'], function(require, angular) {
'use strict';

pageEditor.$inject = [];
function pageEditor() {
    return {
        scope: true,
        templateUrl: require.toUrl('./pageEditor.html'),
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

return pageEditor;

}); // define
