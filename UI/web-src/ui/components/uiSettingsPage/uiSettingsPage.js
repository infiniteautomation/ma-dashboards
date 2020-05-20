/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import uiSettingsPageTemplate from './uiSettingsPage.html';
import './uiSettingsPage.css';

class UiSettingsPageController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maUiSettings', '$scope', 'maDialogHelper', 'maEvents', 'MA_DATE_FORMATS', 'maDiscardCheck']; }
    constructor(maUiSettings, $scope, maDialogHelper, Events, MA_DATE_FORMATS, maDiscardCheck) {
        this.uiSettings = maUiSettings;
        this.$scope = $scope;
        this.maDialogHelper = maDialogHelper
        this.maDiscardCheck = maDiscardCheck;
        
        this.dateFormats = Object.keys(MA_DATE_FORMATS).filter(k => k !== 'iso' && k !== 'isoUtc')
        this.eventLevels = Events.levels.filter(l => l.key !== 'NONE' && l.key !== 'IGNORE');
        this.initDate = new Date();
    }
    
    $onInit() {        
        this.discardCheck = new this.maDiscardCheck({
            $scope: this.$scope,
            isDirty: () => this.form && this.form.$dirty
        });
        
        this.themes = Object.keys(this.uiSettings.themes).map(name => {
            return Object.assign({name}, this.uiSettings.themes[name]);
        });
        
        this.get();
    }
    
    save(event) {
        this.uiSettings.saveStore(this.store).then(store => {
            this.setStore(store);

            this.maDialogHelper.toast('ui.app.uiSettingsSaved');
        }, error => {
            this.maDialogHelper.errorToast(['ui.app.uiSettingsSaveError', error.mangoStatusText]);
        });
    }
    
    get(event) {
        this.uiSettings.getStore().then(store => {
            this.setStore(store);
        });
    }

    resetToDefault(event) {
        this.maDialogHelper.confirm(event, 'ui.app.confirmResetUiSettings').then(() => {
            this.uiSettings.deleteStore(this.store).then(store => {
                this.setStore(store);
                
                this.maDialogHelper.toast('ui.app.uiSettingsSaved');
            }, error => {
                this.maDialogHelper.errorToast(['ui.app.uiSettingsSaveError', error.mangoStatusText]);
            });
        }, error => {});
    }
    
    setStore(store) {
        this.store = store;
        this.data = store.jsonData;
        this.form.$setPristine();
    }
}

export default {
    controller: UiSettingsPageController,
    template: uiSettingsPageTemplate
};
