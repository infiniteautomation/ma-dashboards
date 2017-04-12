/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

uiSettingsFactory.$inject = ['MD_ADMIN_SETTINGS', 'JsonStore', '$mdTheming', '$MD_THEME_CSS', '$mdColors', 'cssInjector', '$templateRequest', '$interpolate', 'mangoDateFormats'];
function uiSettingsFactory(MD_ADMIN_SETTINGS, JsonStore, $mdTheming, $MD_THEME_CSS, $mdColors, cssInjector, $templateRequest, $interpolate, mangoDateFormats) {
    var DASHBOARD_SETTINGS_XID = 'dashboard-settings';
    var NOT_SETTINGS_PROPERTIES = ['defaultSettings', 'userSettingsStore', 'theming', 'themingProvider', 'activeTheme', 'customMenuItems'];
    var themeId = 0;
    var userThemeGenerated = false;
    
    function UiSettings() {
        angular.extend(this, MD_ADMIN_SETTINGS);
        this.theming = $mdTheming;
        
        this.userSettingsStore = new JsonStore();
        this.userSettingsStore.name = DASHBOARD_SETTINGS_XID;
        this.userSettingsStore.xid = DASHBOARD_SETTINGS_XID;
        this.userSettingsStore.jsonData = this.initialSettings || {};
        this.userSettingsStore.publicData = true;
        this.userSettingsStore.readPermission = 'user';
        this.userSettingsStore.editPermission = 'superadmin';

        delete this.initialSettings;
    }

    UiSettings.prototype = {
        save: function save() {
            var differences = deepDiff(this, this.defaultSettings, NOT_SETTINGS_PROPERTIES);
            this.userSettingsStore.jsonData = differences;
            return this.userSettingsStore.$save().then(function(store) {
                angular.merge(this, this.defaultSettings);
                angular.merge(this, store.jsonData);
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
        },
        'delete': function deleteSettings() {
            return this.userSettingsStore.$delete();
        },
        generateTheme: function generateTheme() {
            var themeName = this.defaultTheme;
            var themeSettings = this.themes[themeName];

            // we want to dynamically update the userTheme, $mdTheming.generateTheme() will not re-generate
            // the style tags if it thinks it has already generated them though so work around it
            // by creating a new theme everytime
            var dynamicThemeName;
            if (themeName === 'userTheme') {
                if (userThemeGenerated) {
                    if (themeId > 0) {
                        var prevThemeName = 'dynamicTheme' + themeId;
                        delete this.theming.THEMES[prevThemeName];
                        angular.element('head > style[nonce="' + prevThemeName + '"]').remove();
                    }
                    dynamicThemeName = 'dynamicTheme' + (++themeId);
                    
                    var dynamicTheme = this.themeFromSettings(dynamicThemeName, themeSettings);
                    this.theming.THEMES[dynamicThemeName] = dynamicTheme;
                    
                    this.themingProvider.setNonce(dynamicThemeName);
                    $mdTheming.generateTheme(dynamicThemeName);

                    var theme = this.themeFromSettings('userTheme', themeSettings);
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
            this.generateCustomStyles();
        },
        themeFromSettings: function themeFromSettings(themeName, themeSettings) {
            var theme = this.themingProvider.theme(themeName);
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
            if ($MD_THEME_CSS) {
                angular.element('head > style[tracking-name="interpolatedStyles"]').remove();
                
                $templateRequest(require.toUrl('../styles/interpolatedStyles.css')).then(function(text) {
                    var result = $interpolate(text)({
                        getThemeColor: function(colorString) {
                            return $mdColors.getThemeColor(this.activeTheme + '-' + colorString);
                        }.bind(this),
                        uiSettings: this
                    });
                    cssInjector.injectStyle(result, 'interpolatedStyles', '[href="styles/main.css"]', false, true);
                }.bind(this));
            }
        },
        formatDate: function formatDate(date, format) {
            var momentFormat = mangoDateFormats[format] || format || mangoDateFormats.dateTime;
            return moment(date).format(momentFormat);
        }
    };
    
    function deepDiff(data, defaults, excludeFields) {
        var differences = {};
        for (var key in data) {
            if (excludeFields && excludeFields.indexOf(key) >= 0)
                continue;
            
            var fieldValue = data[key];
            var defaultValue = defaults && defaults[key];
            if (typeof fieldValue !== 'function' && !angular.equals(fieldValue, defaultValue)) {
                if (angular.isObject(fieldValue) && !angular.isArray(fieldValue)) {
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
return uiSettingsFactory;

}); // define
