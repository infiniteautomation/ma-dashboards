/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import themeEditorTemplate from './themeEditor.html';
import './themeEditor.css';

const palettes = ['primary', 'accent', 'warn', 'background'];

class ThemeEditorController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maUiSettings', '$scope', 'maDialogHelper', 'maDiscardCheck', '$state', '$stateParams', '$mdTheming']; }
    
    constructor(maUiSettings, $scope, maDialogHelper, maDiscardCheck, $state, $stateParams, $mdTheming) {
        this.uiSettings = maUiSettings;
        this.$scope = $scope;
        this.maDialogHelper = maDialogHelper;
        this.maDiscardCheck = maDiscardCheck;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$mdTheming = $mdTheming;
        
        this.palettes = palettes;
    }

    $onInit() {
        this.discardCheck = new this.maDiscardCheck({
            $scope: this.$scope,
            isDirty: () => this.form && this.form.$dirty,
            onDiscard: () => this.onDiscard() // TODO
        });
        
        this.get().then(() => {
            let theme = this.$stateParams.theme && this.themes.find(t => t.name === this.$stateParams.theme);
            if (!theme) {
                theme = this.themes[0];
            }
            this.editTheme(theme);
        });
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
    
    editTheme(theme) {
        this.theme = theme;
        this.$state.go('.', {theme: theme.name}, {location: 'replace', notify: false});
    }
    
    getPalettes() {
        return this.$mdTheming.PALETTES;
    }
}

export default {
    controller: ThemeEditorController,
    template: themeEditorTemplate
};
