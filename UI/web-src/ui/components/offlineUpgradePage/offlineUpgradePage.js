/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import offlineUpgradePageTemplate from './offlineUpgradePage.html';

class OfflineUpgradePageController {
    static get $$ngIsClass() { return true; }
    
    static get $inject() {
        return ['maModules', 'maTranslate', 'maDialogHelper', '$scope', '$element', '$state', 'maUiServerInfo'];
    }
    
    constructor(maModules, maTranslate, maDialogHelper, $scope, $element, $state, maUiServerInfo) {
        this.maModules = maModules;
        this.maTranslate = maTranslate;
        this.maDialogHelper = maDialogHelper;
        this.$scope = $scope;
        this.$element = $element;
        this.$state = $state;
        this.maUiServerInfo = maUiServerInfo;
        
        this.backup = true;
        this.restart = true;
    }

    $onInit() {
        this.maModules.getAll().then(modules => {
            this.coreModule = modules.find(module => module.name === 'core');
        });

        this.$scope.$maSubscribe('maWatchdog/LOGGED_IN', (event, current) => {
            delete this.restarting;
            this.$state.go('^');
        });
    }

    downloadModulesManifest() {
        this.maModules.getUpdateLicensePayload();
    }

    restart($event) {
        this.maDialogHelper.confirm($event, ['ui.app.restartInstanceConfirm', this.maUiServerInfo.instanceDescription]).then(() => {
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
        const inputs = this.$element.maFind('input[type=file]');
        if (inputs.length) {
            inputs[0].value = null;
            inputs[0].click();
        }
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
