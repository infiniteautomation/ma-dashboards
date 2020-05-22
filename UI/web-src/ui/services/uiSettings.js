/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import defaultUiSettings from '../uiSettings.json';

uiSettingsProvider.$inject = ['$mdThemingProvider', 'maPointValuesProvider', 'MA_TIMEOUTS', 'MA_DATE_FORMATS'];
function uiSettingsProvider($mdThemingProvider, pointValuesProvider, MA_TIMEOUTS, MA_DATE_FORMATS) {

    // md-theme attribute on the body is still watched as it is a interpolated attribute
    $mdThemingProvider.alwaysWatchTheme(false);
    // register the themes but dont generate the style tags for them until they are used
    $mdThemingProvider.generateThemesOnDemand(true);
    
    // stores the initial merged settings (defaults merged with custom settings from store)
    const MA_UI_SETTINGS = {};

    this.setUiSettings = function setUiSettings(uiSettings) {
        Object.assign(MA_UI_SETTINGS, uiSettings);
        Object.assign(MA_TIMEOUTS, uiSettings.timeouts);
        Object.assign(MA_DATE_FORMATS, uiSettings.dateFormats);
        
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
    };

    this.$get = uiSettingsFactory;

    uiSettingsFactory.$inject = [
        'maJsonStore',
        '$mdTheming',
        '$mdColors',
        'maCssInjector',
        'MA_UI_SETTINGS_XID',
        'MA_UI_EDIT_SETTINGS_PERMISSION',
        '$window',
        'maPointValues',
        '$rootScope',
        'maUtil',
        'maTheming'];
    function uiSettingsFactory(
            JsonStore,
            $mdTheming,
            $mdColors,
            maCssInjector,
            MA_UI_SETTINGS_XID,
            MA_UI_EDIT_SETTINGS_PERMISSION,
            $window,
            maPointValues,
            $rootScope,
            maUtil,
            maTheming) {

        // TODO Mango 4.0 check if still needed
        // contains fix for https://github.com/angular/material/issues/10516
        const userAgent = $window.navigator.userAgent;
        if (userAgent.indexOf('Mac OS X') >= 0 && userAgent.indexOf('Safari/') >= 0 &&
                userAgent.indexOf('Chrome/') < 0 && userAgent.indexOf('Chromium/') < 0) {
            // assign to variable to stop other warnings
            // jshint unused:false
            const safariCss = import(/* webpackChunkName: "ui.safari" */ '../styles/safari.css');
        }

        class UiSettings {
            constructor() {
                angular.extend(this, angular.copy(MA_UI_SETTINGS));

                // watch for changes to the user's preferred color scheme
                if (typeof $window.matchMedia === 'function') {
                    $window.matchMedia('(prefers-color-scheme: light), (prefers-color-scheme: no-preference)').addEventListener('change', event => {
                        $rootScope.$apply(() => {
                            this.applyUiSettings();
                        });
                    });
                }
                
                JsonStore.notificationManager.subscribeToXids([MA_UI_SETTINGS_XID], (event, item) => {
                    // both of these conditions should always be true
                    if (event.name === 'update' && item.xid === MA_UI_SETTINGS_XID) {
                        this.applyJsonData(item.jsonData);
                    }
                }, $rootScope);
                
                this.applyUiSettings();
            }
            
            applyJsonData(data) {
                Object.assign(this, angular.copy(defaultUiSettings));
                angular.merge(this, data);
                this.applyUiSettings();
            }

            saveStore(store) {
                const data = store.jsonData;
                
                if (data.pwaUseThemeColors) {
                    /* jshint camelcase: false */
                    data.pwaManifest.theme_color = $mdColors.getThemeColor('primary-800');
                    data.pwaManifest.background_color = $mdColors.getThemeColor('background');
                }

                const copy = angular.copy(store);
                copy.jsonData = maUtil.deepDiff(data, defaultUiSettings);
                return copy.$save().then(store => {
                    store.jsonData = angular.merge(angular.copy(defaultUiSettings), store.jsonData);
                    return store;
                });
            }
            
            getStore() {
                return JsonStore.get({xid: MA_UI_SETTINGS_XID}).$promise.then(store => {
                    store.jsonData = angular.merge(angular.copy(defaultUiSettings), store.jsonData);
                    return store;
                });
            }
            
            deleteStore(store) {
                const copy = angular.copy(store);
                copy.jsonData = {};
                return copy.$save().then(store => {
                    store.jsonData = angular.merge(angular.copy(defaultUiSettings), store.jsonData);
                    return store;
                });
            }
            
            applyUiSettings() {
                this.applyPreferredColorScheme();
                this.generateTheme();
                Object.assign(MA_TIMEOUTS, this.timeouts);
                Object.assign(MA_DATE_FORMATS, this.dateFormats);
                this.setPointValuesLimit();

                // inject after <meta name="user-styles-after-here">
                maCssInjector.injectLink(this.userCss, 'userCss', 'head > meta[name="user-styles-after-here"]');
            }
            
            setPointValuesLimit() {
                if (isFinite(this.pointValuesLimit)) {
                    maPointValues.setDefaultLimit(this.pointValuesLimit);
                }
            }

            generateTheme() {
                // cant modify the $mdTheming.THEMES object as it is a copy, the correct THEMES object is available here
                const THEMES = $mdThemingProvider._THEMES;
                const themeSettings = this.themes[this.activeTheme];
                
                // It is not possible to regenerate the styles for a theme once it is already registered.
                // We generate a new theme with a temporary UUID name and then replace the UUID inside the styles with the
                // actual theme name.
                const tempName = maUtil.uuid();
                // controls the nonce attribute on the inserted style tags
                $mdThemingProvider.setNonce(tempName);
                // generate the theme
                this.activeThemeObj = this.themeFromSettings(tempName, themeSettings);
                
                // change the temporary theme's name and put it in the correct spot
                this.activeThemeObj.name = this.activeTheme;
                delete THEMES[tempName];
                THEMES[this.activeTheme] = this.activeThemeObj;
                
                for (const e of $window.document.querySelectorAll('head > style[nonce]')) {
                    const nonce = e.getAttribute('nonce');
                    if (nonce === tempName) {
                        // replace the temporary theme name in the style contents with the actual theme name
                        e.textContent = e.textContent.replace(new RegExp(tempName, 'g'), this.activeTheme);
                        e.setAttribute('nonce', this.activeTheme);
                    } else if (nonce === this.activeTheme) {
                        // remove old style tags from the same theme
                        e.parentNode.removeChild(e);
                    }
                }

                // setup the CSS variables for the theme
                this.applyRootTheme(this.activeTheme);
                
                // activate our new theme
                $mdThemingProvider.setDefaultTheme(this.activeTheme);
                this.addThemeColorMetaTags();
            }
            
            themeFromSettings(themeName, themeSettings) {
                $mdTheming.defineTheme(themeName, {
                    primary: themeSettings.primaryPalette,
                    primaryHues: themeSettings.primaryPaletteHues,
                    accent: themeSettings.accentPalette,
                    accentHues: themeSettings.accentPaletteHues,
                    warn: themeSettings.warnPalette,
                    warnHues: themeSettings.warnPaletteHues,
                    background: themeSettings.backgroundPalette,
                    backgroundHues: themeSettings.backgroundPaletteHues,
                    dark: !!themeSettings.dark
                });
                return $mdTheming.THEMES[themeName];
            }

            applyRootTheme(theme) {
                const properties = maTheming.getCssVariables(theme);
                properties.push(
                    {name: '--ma-font-default', value: this.fonts.default},
                    {name: '--ma-font-paragraph', value: this.fonts.paragraph},
                    {name: '--ma-font-heading', value: this.fonts.heading},
                    {name: '--ma-font-code', value: this.fonts.code}
                );
                
                const styles = ':root {\n' + properties.map(p => `${p.name}: ${p.value};`).join('\n') + '\n}';
                maCssInjector.injectStyle(styles, 'ma-variables', 'head > meta[name="user-styles-after-here"]', true);
    
                maTheming.setThemeClasses($window.document.body, theme);
            }

            setMetaTag(name, content) {
                const head = $window.document.querySelector('head');
                let metaTagElement = head.querySelector(`meta[name="${name}"]`);
                if (!metaTagElement) {
                    metaTagElement = $window.document.createElement('meta');
                    metaTagElement.setAttribute('name', name);
                    head.appendChild(metaTagElement);
                }
                metaTagElement.setAttribute('content', content);
            }

            addThemeColorMetaTags() {
                /* jshint camelcase: false */
                let themeColor = this.pwaManifest.theme_color;
                let backgroundColor = this.pwaManifest.background_color;
                if (this.pwaUseThemeColors) {
                    themeColor = $mdColors.getThemeColor('primary-800');
                    backgroundColor = $mdColors.getThemeColor('background');
                }
                
                this.setMetaTag('theme-color', themeColor);
                this.setMetaTag('msapplication-navbutton-color', themeColor);
            }
            
            applyPreferredColorScheme() {
                const defaultTheme = this.themes[this.defaultTheme];
                const alternateTheme = this.themes[this.alternateTheme];
                
                const usePreferred = this.usePreferredColorScheme && typeof $window.matchMedia === 'function';
                if (usePreferred && $window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    this.activeTheme = defaultTheme.dark ? this.defaultTheme : this.alternateTheme;
                    this.themeLogo = defaultTheme.dark ? this.logoSrc : this.alternateLogo;
                } else if (usePreferred && $window.matchMedia('(prefers-color-scheme: light)').matches) {
                    this.activeTheme = !defaultTheme.dark ? this.defaultTheme : this.alternateTheme;
                    this.themeLogo = !defaultTheme.dark ? this.logoSrc : this.alternateLogo;
                } else {
                    this.activeTheme = this.defaultTheme;
                    this.themeLogo = this.logoSrc;
                }
            }
            
            defaultThemeNames() {
                return Object.keys(defaultUiSettings.themes);
            }
        }
        
        return new UiSettings();
    }

}

export default uiSettingsProvider;
