/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import angular from 'angular';
import modulesPageTemplate from './modulesPage.html';
import usernamePasswordPromptTemplate from './usernamePasswordPrompt.html';

class ModulesPageController {
    static get $$ngIsClass() {
        return true;
    }

    static get $inject() {
        return ['maModules', 'maTranslate', 'maDialogHelper', '$scope', '$sce', '$window', 'maUiServerInfo'];
    }

    constructor(maModules, maTranslate, maDialogHelper, $scope, $sce, $window, maUiServerInfo) {
        this.maModules = maModules;
        this.maTranslate = maTranslate;
        this.maDialogHelper = maDialogHelper;
        this.$scope = $scope;
        this.$sce = $sce;
        this.$window = $window;
        this.maUiServerInfo = maUiServerInfo;
    }

    $onInit() {
        this.getModules();

        this.pageUrl = this.$window.location.href;

        this.maModules.getUpdateLicensePayload().then((payload) => {
            this.storeUrl = this.$sce.trustAsResourceUrl(payload.storeUrl + '/account/store');
            delete payload.storeUrl;
            this.updateLicenseStr = angular.toJson(payload, false);
        });

        this.$scope.$maSubscribe('maWatchdog/LOGGED_IN', (event, current) => {
            this.getModules();
        });
    }

    getModules() {
        this.maModules.getAll().then((modules) => {
            let coreModule;
            this.modules = modules.filter((module) => {
                if (module.name === 'core') {
                    coreModule = module;
                    return false;
                }
                return true;
            }).sort((a, b) => {
                const aName = a.name.toLowerCase();
                const bName = b.name.toLowerCase();
                if (aName < bName) return -1;
                if (aName > bName) return 1;
                return 0;
            });
            this.coreModule = coreModule;
        });
    }

    bgColor(module) {
        if (module.unloaded || module.markedForDeletion) return 'warn-hue-3';
//    if (!module.signed) return 'warn-hue-2';
        return 'background-hue-1';
    }

    deleteModule($event, module, doDelete) {
        if (!doDelete)
            return module.$delete(false);

        this.maDialogHelper.confirm($event, 'modules.module.deleteConfirm').then(() => {
            return module.$delete(true);
        }).catch(error => {
            this.maDialogHelper.toastOptions({
                textTr: ['ui.app.deleteModuleFailed', error.mangoStatusText],
                hideDelay: 10000,
                classes: 'md-warn'
            });
        });
    }

    restart($event) {
        this.maDialogHelper.confirm($event, ['ui.app.restartInstanceConfirm', this.maUiServerInfo.instanceDescription]).then(() => {
            return this.maModules.restart();
        }).then(() => {
            this.maDialogHelper.toastOptions({
                textTr: 'modules.restartScheduled',
                hideDelay: 20000
            });
        }, (error) => {
            this.maDialogHelper.toastOptions({
                textTr: ['ui.app.restartFailed', error.mangoStatusText],
                hideDelay: 10000,
                classes: 'md-warn'
            });
        });
    }

    downloadLicense($event) {
        this.maDialogHelper.showBasicDialog($event, {
            titleTr: 'ui.app.enterStoreCredentials',
            contentTemplateUrl: 'modulesPage.usernamePasswordPrompt.html',
            showCancel: true,
            smallDialog: true
        }).then((result) => {
            return this.maModules.downloadLicense(result.username, result.password);
        }).then(() => {
            this.maDialogHelper.toast('ui.app.licenseDownloaded');
            this.getModules();
        }, (error) => {
            if (!error) return; // prompt cancelled
            const msg = 'HTTP ' + error.status + ' - ' + error.data.localizedMessage;
            this.maDialogHelper.toast('ui.app.failedToDownloadLicense', 'md-warn', msg);
        });
    };
}

modulesPageFactory.$inject = ['$templateCache'];

function modulesPageFactory($templateCache) {
    $templateCache.put('modulesPage.usernamePasswordPrompt.html', usernamePasswordPromptTemplate);

    return {
        restrict: 'E',
        scope: {},
        bindToController: true,
        controllerAs: '$ctrl',
        controller: ModulesPageController,
        template: modulesPageTemplate
    };
}

export default modulesPageFactory;
