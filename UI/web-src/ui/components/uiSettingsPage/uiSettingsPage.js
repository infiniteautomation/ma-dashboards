/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import uiSettingsPageTemplate from './uiSettingsPage.html';
import './uiSettingsPage.css';

class UiSettingsPageController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maUiSettings', '$scope', 'maDialogHelper', 'maEvents', 'MA_DATE_FORMATS', 'maDiscardCheck', 'maTheming']; }
    constructor(maUiSettings, $scope, maDialogHelper, Events, MA_DATE_FORMATS, maDiscardCheck, maTheming) {
        this.uiSettings = maUiSettings;
        this.$scope = $scope;
        this.maDialogHelper = maDialogHelper
        this.maDiscardCheck = maDiscardCheck;
        this.maTheming = maTheming;
        
        this.dateFormats = Object.keys(MA_DATE_FORMATS).filter(k => k !== 'iso' && k !== 'isoUtc')
        this.eventLevels = Events.levels.filter(l => l.key !== 'NONE' && l.key !== 'IGNORE');
        this.initDate = new Date();
    }
    
    $onInit() {
        this.discardCheck = new this.maDiscardCheck({
            $scope: this.$scope,
            isDirty: () => this.form && this.form.$dirty,
            onDiscard: () => this.onDiscard() // TODO
        });

        this.get();
    }

    save(event) {
        this.promise = this.uiSettings.saveStore(this.store).then(store => {
            this.setStore(store);

            this.maDialogHelper.toast('ui.app.uiSettingsSaved');
        }, error => {
            this.maDialogHelper.errorToast(['ui.app.uiSettingsSaveError', error.mangoStatusText]);
        }).finally(() => delete this.promise);
        return this.promise;
    }
    
    get(event) {
        this.promise = this.uiSettings.getStore().then(store => {
            this.setStore(store);
        }).finally(() => delete this.promise);
        return this.promise;
    }

    resetToDefault(event) {
        this.promise = this.maDialogHelper.confirm(event, 'ui.app.confirmResetUiSettings').then(() => {
            return this.uiSettings.deleteStore(this.store).then(store => {
                this.setStore(store);
                this.maDialogHelper.toast('ui.app.uiSettingsSaved');
            }, error => {
                this.maDialogHelper.errorToast(['ui.app.uiSettingsSaveError', error.mangoStatusText]);
            });
        }, error => {}).finally(() => delete this.promise);
        return this.promise;
    }
    
    setStore(store) {
        this.store = store;
        this.data = store.jsonData;
        this.form.$setPristine();

        this.themes = Object.keys(this.data.themes).map(name => {
            return Object.assign({name}, this.data.themes[name]);
        });
    }
}

export default {
    controller: UiSettingsPageController,
    template: uiSettingsPageTemplate
};
