/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';

function chooseFile() {
    return {
        restrict: 'A',
        scope: false,
        controller: ChooseFileController,
        bindToController: {
            onChoose: '&?maChooseFile',
            path: '<?maChooseFilePath',
            options: '<?maChooseFileOptions'
        }
    };
}

ChooseFileController.$inject = ['$element', 'maFileStoreDialog'];
function ChooseFileController($element, fileStoreDialog) {
	this.$element = $element;
	this.fileStoreDialog = fileStoreDialog;
}

ChooseFileController.prototype.$onInit = function() {
	this.$element.on('click', function(event) {
		this.fileStoreDialog.show(event, this.path, this.options).then(function(newPath) {
			if (this.onChoose) {
				this.onChoose({$path: newPath});
			}
		}.bind(this));
	}.bind(this));
};

return chooseFile;

}); // define
