/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

SystemStatusPageController.$inject = ['maSystemStatus', 'maServer', 'maUser', '$state', 'maUiMenu', '$mdMedia',
	'$scope', '$timeout', 'maDialogHelper'];
function SystemStatusPageController(systemStatus, maServer, User, $state, maUiMenu, $mdMedia,
		$scope, $timeout, maDialogHelper) {
    this.systemStatus = systemStatus;
    this.maServer = maServer;
    this.User = User;
    this.$state = $state;
    this.menu = maUiMenu;
    this.$mdMedia = $mdMedia;
    this.$scope = $scope;
    this.$timeout = $timeout;
    this.maDialogHelper = maDialogHelper;

    this.logByFileNameUrl = '/rest/v1/logging/view/';
}

SystemStatusPageController.prototype.$onChanges = function(changes) {
};

SystemStatusPageController.prototype.$onInit = function() {
    this.getAuditTrail();
    this.getInternalMetrics();
    this.getLogFilesList();
    this.getWorkItems();
    this.getThreads();
    this.getSystemInfo();
};

SystemStatusPageController.prototype.getAuditTrail = function() {
    var $this = this;

    this.systemStatus.getAuditTrail().then(function(response) {
        $this.auditTrail = response.data.items;
        console.log($this.auditTrail);
    });
};

SystemStatusPageController.prototype.getWorkItems = function() {
    var $this = this;

    this.systemStatus.getWorkItems().then(function(response) {
        $this.workItems = response.data;
    });
};

SystemStatusPageController.prototype.getInternalMetrics = function() {
    var $this = this;

    this.systemStatus.getInternalMetrics().then(function(response) {
        $this.internalMetrics = response.data;
    });
};

SystemStatusPageController.prototype.getLogFilesList = function() {
    var $this = this;

    this.systemStatus.getLogFilesList().then(function(response) {
        $this.logFilesList = response.data;
    });
};

SystemStatusPageController.prototype.getLogDownloadUrl = function(filename) {
    return this.logByFileNameUrl + filename + '?download=true';
};

SystemStatusPageController.prototype.displayLogFile = function(filename) {
    var $this = this;

    this.selectedLogFile = filename;

    this.systemStatus.getLogFile(filename).then(function(response) {
        $this.selectedLogContent = response.data;
    });
};

SystemStatusPageController.prototype.copyLogToClipboard = function() {
    document.querySelector('#logging-console').select();
    document.execCommand('copy');

    this.maDialogHelper.toastOptions({
        text: this.selectedLogFile + ' copied to clipboard',
        hideDelay: 4000
    });
};

SystemStatusPageController.prototype.getThreads = function() {
    var $this = this;

    this.systemStatus.getThreads().then(function(response) {
        $this.threads = response.data;
    });
};

SystemStatusPageController.prototype.getSystemInfo = function() {
    var $this = this;

    this.systemStatus.getFullSystemInfo().then(function(response) {
        $this.systemInfo = response.data;
    });
};

    return {
    controller: SystemStatusPageController,
    templateUrl: require.toUrl('./systemStatusPage.html')
};

}); // define

