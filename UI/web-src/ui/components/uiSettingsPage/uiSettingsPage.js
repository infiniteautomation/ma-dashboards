/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
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
            onDiscard: () => this.uiSettings.applyUiSettings()
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
    
    revert(event) {
        this.get(event).then(() => {
            this.uiSettings.applyUiSettings();
        });
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
            } else if (!themeName.match(/^[a-zA-Z][\w]*$/)) {
                this.maDialogHelper.errorToast(['ui.app.themeNameOnlyWordCharacters']);
                this.addNewTheme(event);
            } else {
                const theme = this.maTheming.defaultTheme();
                this.data.themes[themeName] = theme;
                this.form.$setDirty();
                this.updateThemesArray();
                
                this.data.defaultTheme = themeName;
                this.checkThemes();
                
                this.editTheme(themeName);
            }
        });
    }
    
    editTheme(themeName) {
        this.themeName = themeName;
        
        // ensures that the warn/background palette are always set
        this.theme = this.maUtil.deepMerge(this.maTheming.defaultTheme(), this.data.themes[themeName]);
        
        this.previewTheme();
    }

    previewTheme(name = this.themeName, settings = this.theme) {
        this.form.$setDirty();
        this.uiSettings.generateTheme(name, settings);
        this.uiSettings.applyTheme(name);
    }

    themeEditorClosed() {
        // removes any defaults settings from the theme
        this.data.themes[this.themeName] = this.maUtil.deepDiff(this.theme, this.maTheming.defaultTheme());
        
        delete this.themeName;
        delete this.theme;
        
        // theme might change from light to dark or vice versa
        this.checkThemes();
    }
    
    removeTheme() {
        delete this.data.themes[this.themeName];
        this.updateThemesArray();
        this.form.$setDirty();
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
        
        // active theme might have been deleted
        const activeTheme = this.uiSettings.activeTheme;
        if (activeTheme !== this.data.defaultTheme && activeTheme !== this.data.alternateTheme) {
            this.previewTheme(this.data.defaultTheme);
        }
    }
}

export default {
    controller: UiSettingsPageController,
    template: uiSettingsPageTemplate
};
