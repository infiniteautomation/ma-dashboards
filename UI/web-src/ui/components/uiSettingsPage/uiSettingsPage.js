/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import uiSettingsPageTemplate from './uiSettingsPage.html';
import './uiSettingsPage.css';

class UiSettingsPageController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maUiSettings', '$scope', 'maDialogHelper', 'maEvents', 'MA_DATE_FORMATS', 'maDiscardCheck', 'maTheming', 'maUtil']; }
    constructor(maUiSettings, $scope, maDialogHelper, Events, MA_DATE_FORMATS, maDiscardCheck, maTheming, maUtil) {
        this.uiSettings = maUiSettings;
        this.$scope = $scope;
        this.maDialogHelper = maDialogHelper
        this.maDiscardCheck = maDiscardCheck;
        this.maTheming = maTheming;
        this.maUtil = maUtil;
        
        this.dateFormats = Object.keys(MA_DATE_FORMATS).filter(k => k !== 'iso' && k !== 'isoUtc')
        this.eventLevels = Events.levels.filter(l => l.key !== 'NONE' && l.key !== 'IGNORE');
        this.initDate = new Date();

        this.defaultThemes = maUiSettings.defaultThemeNames().reduce((map, n) => (map[n] = true, map), {});
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
        this.updateThemesArray();
    }
    
    updateThemesArray() {
        this.themes = Object.keys(this.data.themes).map(name => {
            return Object.assign({name}, this.data.themes[name]);
        }).sort((a, b) => {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return 0;
        });
    }
    
    addNewTheme(event) {
        this.maDialogHelper.prompt({
            event,
            shortTr: ['ui.app.enterThemeName']
        }).then(themeName => {
            if (this.data.themes.hasOwnProperty(themeName)) {
                this.maDialogHelper.errorToast(['ui.app.themeExists', themeName]);
                this.addNewTheme(event);
            } else if (themeName.match(/\s/)) {
                // TODO
                this.maDialogHelper.errorToast(['ui.app.themeExists', themeName]);
                this.addNewTheme(event);
            } else {
                const theme = this.maTheming.defaultTheme();
                this.data.themes[themeName] = theme;
                this.themeName = themeName;
                this.theme = theme;
                this.form.$setDirty();
                this.updateThemesArray();
            }
        });
    }
    
    editTheme(themeName) {
        const theme = this.maUtil.deepMerge(this.maTheming.defaultTheme(), this.data.themes[themeName]);
        this.themeName = themeName;
        this.theme = theme;
    }
    
    saveTheme() {
        this.data.themes[this.themeName] = this.theme;
        this.updateThemesArray();
        this.checkThemes();
    }
    
    themeEditorClosed() {
        delete this.themeName;
        delete this.theme;
    }
    
    removeTheme() {
        delete this.data.themes[this.themeName];
        this.form.$setDirty();
        this.updateThemesArray();
        this.checkThemes();
    }
    
    checkThemes() {
        if (!this.data.themes[this.data.defaultTheme]) {
            this.data.defaultTheme = this.themes[0].name;
        }
        if (!this.data.themes[this.data.alternateTheme]) {
            this.data.alternateTheme = this.themes[0].name;
        }

        const defaultDark = !!this.data.themes[this.data.defaultTheme].dark;
        const alternateDark = !!this.data.themes[this.data.alternateTheme].dark;
        
        if (defaultDark === alternateDark) {
            this.data.alternateTheme = this.themes.find(t => !!t.dark !== defaultDark).name;
        }
    }
}

export default {
    controller: UiSettingsPageController,
    template: uiSettingsPageTemplate
};
