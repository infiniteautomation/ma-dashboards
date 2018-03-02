/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import requirejs from 'requirejs/require';


fileStoreDialog.$inject = ['$mdDialog', '$mdMedia'];
function fileStoreDialog($mdDialog, $mdMedia) {
    function FileStoreDialog() {
    }

    FileStoreDialog.prototype.show = function($event, path, options) {
    	return $mdDialog.show({
            controller: function() {
            	this.close = function() {
            		$mdDialog.cancel();
            	};
            	
            	this.done = function() {
            		$mdDialog.hide(this.path);
            	};
            },
            templateUrl: requirejs.toUrl('./fileStoreDialog.html'),
            targetEvent: $event,
            clickOutsideToClose: true,
            escapeToClose: true,
            fullscreen: $mdMedia('xs') || $mdMedia('sm'),
            controllerAs: '$ctrl',
            bindToController: true,
            locals: {
            	path: path,
            	options: options
            }
        });
    };

    return new FileStoreDialog();
}

export default fileStoreDialog;


