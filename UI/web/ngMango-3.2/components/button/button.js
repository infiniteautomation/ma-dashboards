/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

var button = {
    controller: ButtonController,
    templateUrl: require.toUrl('./button.html'),
    bindings: {
    	icon: '@?',
    	label: '@?',
    	tooltip: '@?',
    	raised: '<?',
    	palette: '@?',
    	hue: '@?',
    	labelTr: '@?',
    	labelTrArgs: '<?',
    	tooltipTr: '@?'
    },
    designerInfo: {
    	category: 'basic',
    	icon: 'touch_app',
    	translation: 'dashboardDesigner.button',
    	attributes: {
    		raised: {type: 'boolean'},
    		palette: {options: ['primary', 'accent', 'warn']},
    		hue: {options: ['hue-1', 'hue-2', 'hue-3']},
    		uiSref: { type: 'state-name'},
    		maChooseFile: {},
    		maChooseFilePath: {}
    	}
    }
};

ButtonController.$inject = [];
function ButtonController() {
}

ButtonController.prototype.$onInit = function() {
};

ButtonController.prototype.$onChanges = function(changes) {
	this.classes = {
		'md-icon-button': this.icon && !(this.label || this.labelTr),
		'md-warn': this.palette === 'warn',
		'md-accent': this.palette === 'accent',
		'md-primary': this.palette === 'primary',
		'md-hue-1': this.hue === 'hue-1',
		'md-hue-2': this.hue === 'hue-2',
		'md-hue-3': this.hue === 'hue-3',
		'md-raised': this.raised
	};
};

return button;

}); // define
