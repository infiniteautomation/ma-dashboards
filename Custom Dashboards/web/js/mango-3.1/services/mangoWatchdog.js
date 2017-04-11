/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';

function mangoWatchdog(mangoWatchdogTimeout, $timeout, $rootScope) {
	
	function MangoWatchdog(options) {
		this.failed = false;
		this.enabled = true;
		angular.extend(this, options);
		if (this.timeout <= 0)
			this.enabled = false;
	}

	MangoWatchdog.prototype.enable = function() {
		this.enabled = true;
	};
	
	MangoWatchdog.prototype.disable = function() {
		this.enabled = false;
	};
	
	MangoWatchdog.prototype.reset = function() {
		var _this = this;
		this.failed = false;
		
		if (!this.timeout || !this.enabled) return;
		
		if (this.promise) {
			$timeout.cancel(this.promise);
		}
		this.promise = $timeout(function() {
			$rootScope.$broadcast('mangoWatchdogTimeout');
			_this.failed = true;
		}, this.timeout);
	};
	
	return new MangoWatchdog({timeout: mangoWatchdogTimeout});
}

mangoWatchdog.$inject = ['mangoWatchdogTimeout', '$timeout', '$rootScope'];

return mangoWatchdog;

}); // define
