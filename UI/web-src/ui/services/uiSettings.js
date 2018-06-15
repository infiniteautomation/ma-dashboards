/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import interpolatedStyles from '../styles/interpolatedStyles.css';

uiSettingsFactory.$inject = ['MA_UI_SETTINGS', 'maJsonStore', '$mdTheming', '$MD_THEME_CSS', '$mdColors', 'maCssInjector', '$templateRequest', '$interpolate',
    'MA_UI_SETTINGS_XID', 'MA_UI_EDIT_SETTINGS_PERMISSION', 'MA_POINT_VALUES_CONFIG', '$window'];
function uiSettingsFactory(MA_UI_SETTINGS, JsonStore, $mdTheming, MD_THEME_CSS, $mdColors, cssInjector, $templateRequest, $interpolate,
        MA_UI_SETTINGS_XID, MA_UI_EDIT_SETTINGS_PERMISSION, MA_POINT_VALUES_CONFIG, $window) {
    
    const NOT_SETTINGS_PROPERTIES = ['defaultSettings', 'userSettingsStore', 'theming', 'themingProvider', 'activeTheme', 'userModuleName', 'mangoModuleNames',
        'activeThemeObj'];
    let themeId = 0;
    let userThemeGenerated = false;
    
    function UiSettings() {
        angular.extend(this, MA_UI_SETTINGS);
        this.theming = $mdTheming;
        
        this.userSettingsStore = new JsonStore();
        this.userSettingsStore.name = 'UI Settings';
        this.userSettingsStore.xid = MA_UI_SETTINGS_XID;
        this.userSettingsStore.jsonData = this.initialSettings || null;
        this.userSettingsStore.publicData = true;
        this.userSettingsStore.readPermission = '';
        this.userSettingsStore.editPermission = MA_UI_EDIT_SETTINGS_PERMISSION;

        delete this.initialSettings;
    }

    UiSettings.prototype = {
        save: function save() {
            const differences = deepDiff(this, this.defaultSettings, NOT_SETTINGS_PROPERTIES);
            this.userSettingsStore.jsonData = differences;
            return this.userSettingsStore.$save().then(function(store) {
                angular.merge(this, this.defaultSettings);
                angular.merge(this, store.jsonData);
                if (isFinite(this.pointValuesLimit)) {
                	MA_POINT_VALUES_CONFIG.limit = this.pointValuesLimit;
                }
                return store;
            }.bind(this));
        },
        get: function get() {
            return this.userSettingsStore.$get().then(function(store) {
                angular.merge(this, this.defaultSettings);
                angular.merge(this, store.jsonData);
                return store;
            }.bind(this));
        },
        reset: function reset() {
            angular.merge(this, this.defaultSettings);
            angular.merge(this, this.userSettingsStore.jsonData);
            this.generateTheme();
        },
        'delete': function deleteSettings() {
            return this.userSettingsStore.$delete().then(() => {
                this.reset();
            });
        },
        generateTheme: function generateTheme() {
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
                        delete this.theming.THEMES[prevThemeName];
                        angular.element('head > style[nonce="' + prevThemeName + '"]').remove();
                    }
                    dynamicThemeName = 'dynamicTheme' + (++themeId);
                    
                    const dynamicTheme = this.themeFromSettings(dynamicThemeName, themeSettings);
                    this.theming.THEMES[dynamicThemeName] = dynamicTheme;
                    
                    this.themingProvider.setNonce(dynamicThemeName);
                    $mdTheming.generateTheme(dynamicThemeName);

                    const theme = this.themeFromSettings('userTheme', themeSettings);
                    this.theming.THEMES.userTheme = theme;
                }
                userThemeGenerated = true;
            }
            
            this.themingProvider.setNonce(themeName);
            $mdTheming.generateTheme(themeName);
            this.activeTheme = dynamicThemeName || themeName;
            this.themingProvider.setDefaultTheme(this.activeTheme);
            this.theming.setBrowserColor({
                theme: this.activeTheme
            });
            this.activeThemeObj = this.theming.THEMES[this.activeTheme];
            this.generateCustomStyles();
        },
        themeFromSettings: function themeFromSettings(themeName, themeSettings) {
            const theme = this.themingProvider.theme(themeName);
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
        },
        generateCustomStyles: function generateCustomStyles() {
            // inserts a style tag to style <a> tags with accent color
            if (MD_THEME_CSS) {
                const oldStyles = $window.document.querySelector('head > style[tracking-name="interpolatedStyles"]');
                if (oldStyles) {
                    oldStyles.parentNode.removeChild(oldStyles);
                }
                
                const result = $interpolate(interpolatedStyles)({
                    getThemeColor: function(colorString) {
                        return $mdColors.getThemeColor(this.activeTheme + '-' + colorString);
                    }.bind(this),
                    uiSettings: this,
                    theme: this.activeThemeObj
                });
                cssInjector.injectStyle(result, 'interpolatedStyles', 'meta[name="user-styles-after-here"]', true, true);
            }
        }
    };
    
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

export default uiSettingsFactory;
