/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import offlineUpgradePageTemplate from './offlineUpgradePage.html';

class OfflineUpgradePageController {
    static get $$ngIsClass() { return true; }
    
    static get $inject() {
        return ['maModules', 'maTranslate', 'maDialogHelper', '$scope', '$element', '$state'];
    }
    
    constructor(maModules, maTranslate, maDialogHelper, $scope, $element, $state) {
        this.maModules = maModules;
        this.maTranslate = maTranslate;
        this.maDialogHelper = maDialogHelper;
        this.$scope = $scope;
        this.$element = $element;
        this.$state = $state;
        
        this.backup = true;
        this.restart = true;
    }

    $onInit() {
        this.maModules.getAll().then(modules => {
            this.coreModule = modules.find(module => module.name === 'core');
        });
        
        this.$scope.$on('maWatchdog', (event, current, previous) => {
            if (current.status !== previous.status && current.status === 'LOGGED_IN') {
                delete this.restarting;
                this.$state.go('^');
            }
        });
    }

    downloadModulesManifest() {
        this.maModules.getUpdateLicensePayload();
    }

    restart($event) {
        this.maDialogHelper.confirm($event, 'modules.restartConfirm').then(() => {
            return this.maModules.restart();
        }).then(() => {
            this.maDialogHelper.toastOptions({
                textTr: 'modules.restartScheduled',
                hideDelay: 20000
            });
        }, error => {
            this.maDialogHelper.toastOptions({
                textTr: ['ui.app.restartFailed', error.mangoStatusText || '' + error],
                hideDelay: 10000,
                classes: 'md-warn'
            });
        });
    }

    uploadFilesButtonClicked(event) {
        this.$element.find('input[type=file]').trigger('click');
    }

    uploadFilesChanged(event) {
        const files = event.target.files;
        this.uploadFiles(files);
    }

    fileDropped(data) {
        if (this.uploading || this.restarting) return;
        
        const types = data.getDataTransferTypes();
        if (types.includes('Files')) {
            const files = data.getDataTransfer();
            this.uploadFiles(files);
        }
    }

    uploadFiles(files) {
        this.uploading = true;
        
        const restart = this.restart;
        this.maModules.uploadZipFiles(files, restart).then(result => {
            delete this.uploading;
            if (restart) {
                this.restarting = true;
                this.maDialogHelper.toastOptions({
                    textTr: 'modules.restartScheduled',
                    hideDelay: 20000
                });
            } else {
                this.maDialogHelper.toastOptions({
                    textTr: 'ui.app.moduleZipFilesUploaded'
                });
            }
        }, error => {
            delete this.uploading;
            this.maDialogHelper.toastOptions({
                textTr: ['ui.app.moduleZipFilesUploadError', error.mangoStatusText || '' + error],
                hideDelay: 10000,
                classes: 'md-warn'
            });
        });
    }
}

offlineUpgradePageFactory.$inject = [];
function offlineUpgradePageFactory() {
    return {
        restrict: 'E',
        scope: {},
        bindToController: true,
        controllerAs: '$ctrl',
        controller: OfflineUpgradePageController,
        template: offlineUpgradePageTemplate
    };
}

export default offlineUpgradePageFactory;
