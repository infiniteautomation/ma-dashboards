/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import basicDialogTemplate from './basicDialog.html';
import configImportDialogContainerTemplate from '../components/configImportDialog/configImportDialogContainer.html';
import angular from 'angular';

DialogHelperFactory.$inject = ['$injector', 'maTranslate', 'maSystemActions', '$q', 'maUtil'];
function DialogHelperFactory($injector, maTranslate, maSystemActions, $q, maUtil) {
    
    let $mdDialog, $mdMedia, $mdToast;
    if ($injector.has('$mdDialog')) {
        $mdDialog = $injector.get('$mdDialog');
        $mdMedia = $injector.get('$mdMedia');
        $mdToast = $injector.get('$mdToast');
    }
    
    class DialogHelper {

        showDialog(template, locals, $event) {
            return $mdDialog.show({
                controller: function() {},
                template: template,
                targetEvent: $event,
                clickOutsideToClose: false,
                escapeToClose: false,
                fullscreen: $mdMedia('xs') || $mdMedia('sm'),
                controllerAs: '$ctrl',
                bindToController: true,
                locals: locals
            });
        }
        
        showBasicDialog($event, locals) {
            return $mdDialog.show({
                controller: function() {
                    this.result = {};
                    this.$mdDialog = $mdDialog;
                    
                    this.cancel = function() {
                        this.$mdDialog.cancel();
                    };
                    
                    this.ok = function() {
                        this.$mdDialog.hide(this.result);
                    };
                },
                template: basicDialogTemplate,
                targetEvent: $event,
                clickOutsideToClose: true,
                escapeToClose: true,
                fullscreen: $mdMedia('xs') || (!locals.smallDialog && $mdMedia('sm')),
                controllerAs: '$ctrl',
                bindToController: true,
                locals: locals
            });
        }

        confirm(event, translation) {
            return maTranslate.trAll({
                textContent: translation || 'ui.app.areYouSure',
                areYouSure: 'ui.app.areYouSure',
                okText: 'login.ok',
                cancelText: 'login.cancel'
            }).then(({textContent, areYouSure, okText, cancelText}) => {
                const confirm = $mdDialog.confirm()
                    .title(areYouSure)
                    .ariaLabel(areYouSure)
                    .textContent(textContent)
                    .targetEvent(event)
                    .ok(okText)
                    .cancel(cancelText)
                    .multiple(true);

                return $mdDialog.show(confirm);
            });
        }

        prompt(event, shortTr, longTr, placeHolderTr, initialValue) {
            return maTranslate.trAll({
                shortText: shortTr,
                longText: longTr,
                placeHolderText: placeHolderTr,
                okText: 'login.ok',
                cancelText: 'login.cancel'
            }).then(({shortText, longText, placeHolderText, okText, cancelText}) => {
                const prompt = $mdDialog.prompt()
                    .title(shortText)
                    .ariaLabel(shortText)
                    .targetEvent(event)
                    .ok(okText)
                    .cancel(cancelText)
                    .multiple(true);
                
                if (longText) {
                    prompt.textContent(longText);
                }
                
                if (placeHolderText) {
                    prompt.placeholder(placeHolderText);
                }
                
                if (initialValue != null) {
                    prompt.initialValue(initialValue);
                }

                return $mdDialog.show(prompt);
            });
        }
        
        toast(translation, classes) {
            const translationArgs = Array.prototype.slice.call(arguments, 2);
            const translatableMessage = Array.isArray(translation) ? translation : [translation, ...translationArgs];

            return maTranslate.trAll({
                text: translatableMessage,
                okText: 'login.ok'
            }).then(({text, okText}) => {
                const toast = $mdToast.simple()
                    .textContent(text)
                    .action(okText)
                    .highlightAction(true)
                    .position('bottom center')
                    .hideDelay(5000);
                
                if (classes) {
                    toast.toastClass(classes);
                }
                
                return $mdToast.show(toast);
            });
        }
        
        errorToast(translation) {
            return maTranslate.trAll({
                text: translation,
                okText: 'login.ok'
            }).then(({text, okText}) => {
                const toast = $mdToast.simple()
                    .textContent(text)
                    .action(okText)
                    .highlightAction(true)
                    .position('bottom center')
                    .hideDelay(10000)
                    .toastClass('md-warn');

                return $mdToast.show(toast);
            });
        }
        
        toastOptions(options) {
            return maTranslate.trAll({
                text: options.textTr,
                okText: 'login.ok'
            }).then(({text, okText}) => {
                const toast = $mdToast.simple()
                    .textContent(text || options.text)
                    .action(okText)
                    .highlightAction(true)
                    .position('bottom center')
                    .hideDelay(isFinite(options.hideDelay) ? options.hideDelay : 5000);
                
                if (options.classes) {
                    toast.toastClass(options.classes);
                }
                
                return $mdToast.show(toast);
            });
        }
        
        httpErrorToast(error, allowedCodes = []) {
            if (allowedCodes.includes(error.status)) {
                return $q.resolve();
            }

            return maTranslate.trAll({
                text: ['ui.app.genericRestError', error.mangoStatusText],
                okText: 'login.ok'
            }).then(({text, okText}) => {
                const toast = $mdToast.simple()
                    .textContent(text)
                    .action(okText)
                    .highlightAction(true)
                    .position('bottom center')
                    .toastClass('md-warn')
                    .hideDelay(10000);

                return $mdToast.show(toast);
            });
        }

        showConfigImportDialog(importData, $event) {
            const locals = {importData: importData};
            return this.showDialog(configImportDialogContainerTemplate, locals, $event);
        }
        
//        options = {
//          event,
//          confirmTr,
//          actionName,
//          actionData,
//          descriptionTr,
//          resultsTr
//        }
        confirmSystemAction(options) {
            return maTranslate.tr(options.descriptionTr).then(description => {
                return this.confirm(options.event, options.confirmTr).then(() => {
                    return maSystemActions.trigger(options.actionName, options.actionData).then(triggerResult => {
                        this.toastOptions({textTr: ['ui.app.systemAction.started', description], hideDelay: 0});
                        return triggerResult.refreshUntilFinished();
                    }, error => {
                        this.toastOptions({textTr: ['ui.app.systemAction.startFailed', description, error.mangoStatusText],
                            hideDelay: 10000, classes: 'md-warn'});
                        return $q.reject();
                    });
                }).then(finishedResult => {
                    const results = finishedResult.results;
                    if (results.failed) {
                        const msg = results.exception ? results.exception.message : '';
                        this.toastOptions({textTr: ['ui.app.systemAction.failed', description, msg], hideDelay: 10000, classes: 'md-warn'});
                    } else {
                        const resultTxt = maTranslate.trSync(options.resultsTr, results);
                        this.toastOptions({textTr: ['ui.app.systemAction.succeeded', description, resultTxt]});
                    }
                }, angular.noop);
            });
        }
    }

    return new DialogHelper();
}

export default DialogHelperFactory;


