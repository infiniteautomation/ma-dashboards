/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';


function chooseFile() {
    return {
        restrict: 'A',
        scope: false,
        controller: ChooseFileController,
        bindToController: {
            onChoose: '&?maChooseFile',
            selected: '<?maChooseFileSelected',
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
		this.fileStoreDialog.show(event, this.selected || this.path, this.options).then(function(urls) {
			if (this.onChoose) {
				if (angular.isArray(urls)) {
					this.onChoose({$urls: urls, $path: urls});
				} else {
					this.onChoose({$url: urls, $path: urls});
				}
			}
		}.bind(this));
	}.bind(this));
};

export default chooseFile;


