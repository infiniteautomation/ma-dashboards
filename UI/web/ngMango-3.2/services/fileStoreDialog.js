/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

fileStoreDialog.$inject = ['$mdDialog', '$mdMedia'];
function fileStoreDialog($mdDialog, $mdMedia) {
    function FileStoreDialog() {
    }

    FileStoreDialog.prototype.show = function($event, path) {
    	return $mdDialog.show({
            controller: function() {
            	this.close = function() {
            		$mdDialog.cancel();
            	};
            	
            	this.done = function() {
            		$mdDialog.hide(this.path);
            	};
            },
            templateUrl: require.toUrl('./fileStoreDialog.html'),
            targetEvent: $event,
            clickOutsideToClose: true,
            escapeToClose: true,
            fullscreen: $mdMedia('xs') || $mdMedia('sm'),
            controllerAs: '$ctrl',
            bindToController: true,
            locals: {
            	path: path
            }
        });
    };

    return new FileStoreDialog();
}

return fileStoreDialog;

}); // define
