/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import interpolatedStyles from '../styles/interpolatedStyles.css';
import defaultUiSettings from '../uiSettings.json';

uiSettingsProvider.$inject = ['$mdThemingProvider', 'maPointValuesProvider', 'MA_TIMEOUTS'];
function uiSettingsProvider($mdThemingProvider, pointValuesProvider, MA_TIMEOUTS) {
    
    // stores the initial merged settings (defaults merged with custom settings from store)
    const MA_UI_SETTINGS = {};

    this.setUiSettings = function setUiSettings(uiSettings) {
        Object.assign(MA_UI_SETTINGS, uiSettings);
        Object.assign(MA_TIMEOUTS, uiSettings.timeouts);
        
        this.registerThemes();
        
        if (isFinite(uiSettings.pointValuesLimit)) {
            pointValuesProvider.setDefaultLimit(uiSettings.pointValuesLimit);
        }
    };
    
    this.registerThemes = function registerThemes() {
        if (MA_UI_SETTINGS.palettes) {
            for (const paletteName in MA_UI_SETTINGS.palettes) {
                $mdThemingProvider.definePalette(paletteName, angular.copy(MA_UI_SETTINGS.palettes[paletteName]));
            }
        }

        if (MA_UI_SETTINGS.themes) {
            for (const name in MA_UI_SETTINGS.themes) {
                const themeSettings = MA_UI_SETTINGS.themes[name];
                const theme = $mdThemingProvider.theme(name);
                if (themeSettings.primaryPalette) {
                    theme.primaryPalette(themeSettings.primaryPalette, themeSettings.primaryPaletteHues);
                }
                if (themeSettings.accentPalette) {
                    theme.accentPalette(themeSettings.accentPalette, themeSettings.accentPaletteHues);
                }
                if (themeSettings.warnPalette) {
                    theme.warnPalette(themeSettings.warnPalette, themeSettings.warnPaletteHues);
                }
                if (themeSettings.backgroundPalette) {
                    theme.backgroundPalette(themeSettings.backgroundPalette, themeSettings.backgroundPaletteHues);
                }
                if (themeSettings.dark) {
                    theme.dark();
                }
            }
        }

        const defaultTheme = MA_UI_SETTINGS.defaultTheme || 'mangoDark';
        $mdThemingProvider.setDefaultTheme(defaultTheme);
        $mdThemingProvider.alwaysWatchTheme(true);
        $mdThemingProvider.generateThemesOnDemand(true);
        $mdThemingProvider.enableBrowserColor({
            theme: defaultTheme
        });
    };
    
    this.$get = uiSettingsFactory;

    uiSettingsFactory.$inject = [
        'maJsonStore',
        '$mdTheming',
        '$MD_THEME_CSS',
        '$mdColors',
        'maCssInjector',
        '$templateRequest',
        '$interpolate',
        'MA_UI_SETTINGS_XID',
        'MA_UI_EDIT_SETTINGS_PERMISSION',
        '$window',
        'maPointValues'];
    function uiSettingsFactory(
            JsonStore,
            $mdTheming,
            MD_THEME_CSS,
            $mdColors,
            maCssInjector,
            $templateRequest,
            $interpolate,
            MA_UI_SETTINGS_XID,
            MA_UI_EDIT_SETTINGS_PERMISSION,
            $window,
            maPointValues) {

        if (MA_UI_SETTINGS.userCss) {
            maCssInjector.injectLink(MA_UI_SETTINGS.userCss, 'userCss', 'meta[name="user-styles-after-here"]');
        }
        
        // contains fix for https://github.com/angular/material/issues/10516
        const userAgent = $window.navigator.userAgent;
        if (userAgent.indexOf('Mac OS X') >= 0 && userAgent.indexOf('Safari/') >= 0 &&
                userAgent.indexOf('Chrome/') < 0 && userAgent.indexOf('Chromium/') < 0) {
            // assign to variable to stop other warnings
            // jshint unused:false
            const safariCss = import(/* webpackChunkName: "ui.safari" */ '../styles/safari.css');
        }

        const excludeProperties = ['userSettingsStore', 'theming', 'activeTheme', 'userModuleName', 'mangoModuleNames',
            'activeThemeObj'];
        let themeId = 0;
        let userThemeGenerated = false;
        
        class UiSettings {
            constructor() {
                angular.extend(this, angular.copy(MA_UI_SETTINGS));
                
                // used on uiSettingsPage.html to display available themes and palettes
                this.theming = $mdTheming;
                
                this.userSettingsStore = new JsonStore();
                this.userSettingsStore.name = 'UI Settings';
                this.userSettingsStore.xid = MA_UI_SETTINGS_XID;
                this.userSettingsStore.jsonData = deepDiff(this, defaultUiSettings, excludeProperties);
                this.userSettingsStore.publicData = true;
                this.userSettingsStore.readPermission = '';
                this.userSettingsStore.editPermission = MA_UI_EDIT_SETTINGS_PERMISSION;
            }

            save() {
                const differences = deepDiff(this, defaultUiSettings, excludeProperties);
                this.userSettingsStore.jsonData = differences;
                return this.userSettingsStore.$save().then(store => {
                    angular.merge(this, defaultUiSettings);
                    angular.merge(this, store.jsonData);
                    this.applyUiSettings();
                    return store;
                });
            }
            
            get() {
                return this.userSettingsStore.$get().then(store => {
                    angular.merge(this, defaultUiSettings);
                    angular.merge(this, store.jsonData);
                    this.applyUiSettings();
                    return store;
                });
            }
            
            // revert on ui settings page
            reset() {
                angular.merge(this, defaultUiSettings);
                angular.merge(this, this.userSettingsStore.jsonData);
                this.applyUiSettings();
                this.generateTheme();
            }
            
            'delete'() {
                this.userSettingsStore.jsonData = {};
                return this.userSettingsStore.$save().then(store => {
                    this.reset();
                });
            }
            
            applyUiSettings() {
                Object.assign(MA_TIMEOUTS, this.timeouts);
                this.setPointValuesLimit();
            }
            
            setPointValuesLimit() {
                if (isFinite(this.pointValuesLimit)) {
                    maPointValues.setDefaultLimit(this.pointValuesLimit);
                }
            }
            
            generateTheme() {
                const themeName = this.defaultTheme;
                const themeSettings = this.themes[themeName];

                // we want to dynamically update the userTheme, $mdTheming.generateTheme() will not re-generate
                // the style tags if it thinks it has already generated them though so work around it
                // by creating a new theme everytime
                let dynamicThemeName;
                if (themeName === 'userTheme') {
                    if (userThemeGenerated) {
                        if (themeId > 0) {
                            const prevThemeName = 'dynamicTheme' + themeId;
                            delete $mdTheming.THEMES[prevThemeName];
                            angular.element('head > style[nonce="' + prevThemeName + '"]').remove();
                        }
                        dynamicThemeName = 'dynamicTheme' + (++themeId);
                        
                        const dynamicTheme = this.themeFromSettings(dynamicThemeName, themeSettings);
                        $mdTheming.THEMES[dynamicThemeName] = dynamicTheme;
                        
                        $mdThemingProvider.setNonce(dynamicThemeName);
                        $mdTheming.generateTheme(dynamicThemeName);

                        const theme = this.themeFromSettings('userTheme', themeSettings);
                        $mdTheming.THEMES.userTheme = theme;
                    }
                    userThemeGenerated = true;
                }
                
                $mdThemingProvider.setNonce(themeName);
                $mdTheming.generateTheme(themeName);
                this.activeTheme = dynamicThemeName || themeName;
                $mdThemingProvider.setDefaultTheme(this.activeTheme);
                $mdTheming.setBrowserColor({
                    theme: this.activeTheme
                });
                this.activeThemeObj = $mdTheming.THEMES[this.activeTheme];
                this.generateCustomStyles();
            }
            
            themeFromSettings(themeName, themeSettings) {
                const theme = $mdThemingProvider.theme(themeName);
                if (themeSettings.primaryPalette) {
                    theme.primaryPalette(themeSettings.primaryPalette, themeSettings.primaryPaletteHues);
                }
                if (themeSettings.accentPalette) {
                    theme.accentPalette(themeSettings.accentPalette, themeSettings.accentPaletteHues);
                }
                if (themeSettings.warnPalette) {
                    theme.warnPalette(themeSettings.warnPalette, themeSettings.warnPaletteHues);
                }
                if (themeSettings.backgroundPalette) {
                    theme.backgroundPalette(themeSettings.backgroundPalette, themeSettings.backgroundPaletteHues);
                }
                theme.dark(!!themeSettings.dark);
                return theme;
            }
            
            generateCustomStyles() {
                // inserts a style tag to style <a> tags with accent color
                if (MD_THEME_CSS) {
                    const oldStyles = $window.document.querySelector('head > style[tracking-name="interpolatedStyles"]');
                    if (oldStyles) {
                        oldStyles.parentNode.removeChild(oldStyles);
                    }
                    
                    const result = $interpolate(interpolatedStyles)({
                        getThemeColor: colorString => {
                            return $mdColors.getThemeColor(this.activeTheme + '-' + colorString);
                        },
                        uiSettings: this,
                        theme: this.activeThemeObj
                    });
                    maCssInjector.injectStyle(result, 'interpolatedStyles', 'meta[name="user-styles-after-here"]', true, true);
                }
            }
        }
        
        function deepDiff(data, defaults, excludeFields) {
            const differences = {};
            for (const key in data) {
                if (excludeFields && excludeFields.indexOf(key) >= 0)
                    continue;
                
                const fieldValue = data[key];
                const defaultValue = defaults && defaults[key];
                if (typeof fieldValue !== 'function' && !angular.equals(fieldValue, defaultValue)) {
                    if (fieldValue && typeof fieldValue === 'object' && !Array.isArray(fieldValue)) {
                        differences[key] = deepDiff(fieldValue, defaultValue);
                    } else {
                        differences[key] = fieldValue;
                    }
                }
            }
            return differences;
        }
        
        return new UiSettings();
    }

}

export default uiSettingsProvider;
