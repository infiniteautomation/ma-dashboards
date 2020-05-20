/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import uiSettingsPageTemplate from './uiSettingsPage.html';
import './uiSettingsPage.css';

class UiSettingsPageController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maUiSettings', '$scope', '$window', 'maTranslate', 'maDialogHelper', 'maEvents', 'MA_DATE_FORMATS']; }
    constructor(maUiSettings, $scope, $window, maTranslate, maDialogHelper, Events, MA_DATE_FORMATS) {
        this.uiSettings = maUiSettings;
        this.$scope = $scope;
        this.$window = $window;
        this.maTranslate = maTranslate;
        this.maDialogHelper = maDialogHelper
        
        this.dateFormats = Object.keys(MA_DATE_FORMATS).filter(k => k !== 'iso' && k !== 'isoUtc')
        this.eventLevels = Events.levels.filter(l => l.key !== 'NONE' && l.key !== 'IGNORE');
        this.initDate = new Date();
    }
    
    $onInit() {
        this.$scope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => {
            if (event.defaultPrevented) return;
            
            if (this.form.$dirty) {
                if (!this.$window.confirm(this.maTranslate.trSync('ui.app.discardUnsavedChanges'))) {
                    event.preventDefault();
                    return;
                }
            }
            
            this.uiSettings.reset();
        });

        const oldUnload = this.$window.onbeforeunload;
        this.$window.onbeforeunload = (event) => {
            if (this.form.$dirty) {
                const text = this.maTranslate.trSync('ui.app.discardUnsavedChanges');
                event.returnValue = text;
                return text;
            }
        };
        
        this.$scope.$on('$destroy', () => {
            this.$window.onbeforeunload = oldUnload;
        });
        
        this.themes = Object.keys(this.uiSettings.themes).map(name => {
            return Object.assign({name}, this.uiSettings.themes[name]);
        });
    }
    
    save(event) {
        this.uiSettings.save().then(() => {
            this.form.$setPristine();

            this.maDialogHelper.toast('ui.app.uiSettingsSaved');
        }, error => {
            this.maDialogHelper.errorToast(['ui.app.uiSettingsSaveError', error.mangoStatusText]);
        });
    }
    
    revert(event) {
        this.uiSettings.reset();
        this.form.$setPristine();
    }

    resetToDefault(event) {
        this.maDialogHelper.confirm(event, 'ui.app.confirmResetUiSettings').then(() => {
            this.uiSettings.delete().then(() => {
                this.form.$setPristine();
                
                this.maDialogHelper.toast('ui.app.uiSettingsSaved');
            }, error => {
                this.maDialogHelper.errorToast(['ui.app.uiSettingsSaveError', error.mangoStatusText]);
            });
        }, angular.noop);
    }
}

export default {
    controller: UiSettingsPageController,
    template: uiSettingsPageTemplate
};


