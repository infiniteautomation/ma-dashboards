/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
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
        
        if (MA_UI_SETTINGS.palettes) {
            for (const paletteName in MA_UI_SETTINGS.palettes) {
                $mdThemingProvider.definePalette(paletteName, angular.copy(MA_UI_SETTINGS.palettes[paletteName]));
            }
        }
        
        if (isFinite(uiSettings.pointValuesLimit)) {
            pointValuesProvider.setDefaultLimit(uiSettings.pointValuesLimit);
        }
    };

    this.$get = uiSettingsFactory;

    uiSettingsFactory.$inject = [
        'maJsonStore',
        '$mdTheming',
        '$mdColors',
        'maCssInjector',
        'MA_UI_SETTINGS_XID',
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
                    const match = $window.matchMedia('(prefers-color-scheme: light), (prefers-color-scheme: no-preference)');
                    // addEventListener not supported in Safari
                    const fnName = typeof match.addEventListener === 'function' ? 'addEventListener' : 'addListener';
                    match[fnName]('change', event => {
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
                const preferredTheme = this.getPreferredTheme();
                this.generateThemes(preferredTheme);
                this.applyTheme(preferredTheme);
                Object.assign(MA_TIMEOUTS, this.timeouts);
                Object.assign(MA_DATE_FORMATS, this.dateFormats);
                this.setPointValuesLimit();

                const userCssUrl = maUtil.fileStoreUrl(this.userCss || '');

                // inject after <meta name="user-styles-after-here">
                maCssInjector.injectLink(userCssUrl, 'userCss', 'head > meta[name="user-styles-after-here"]');
            }
            
            setPointValuesLimit() {
                if (isFinite(this.pointValuesLimit)) {
                    maPointValues.setDefaultLimit(this.pointValuesLimit);
                }
            }
            
            // ensures that the THEMES objects are up to date and will regenerate the styles for any theme which already has styles present
            generateThemes(ensureGenerated) {
                const styles = $window.document.querySelectorAll('head > style[nonce]');
                const generatedThemes = new Set(Array.from(styles).map(e => e.getAttribute('nonce')));

                for (const name in this.themes) {
                    this.generateTheme(name, null, name === ensureGenerated || generatedThemes.has(name));
                }
            }
            
            generateTheme(name, settings, generateStyles = true) {
                // cant modify the $mdTheming.THEMES object as it is a copy, the correct THEMES object is available here
                const THEMES = $mdThemingProvider._THEMES;
                const themeSettings = settings || this.themes[name];
                
                // It is not possible to regenerate the styles for a theme once it is already registered.
                // We generate a new theme with a temporary UUID name and then replace the UUID inside the styles with the
                // actual theme name.
                const tempName = 'temp' + maUtil.uuid().replace(/-/g, '');
                // register the theme
                const theme = this.registerTheme(tempName, themeSettings);

                if (generateStyles) {
                    // controls the nonce attribute on the inserted style tags
                    $mdThemingProvider.setNonce(tempName);
                    // generate and insert the styles
                    $mdTheming.generateTheme(tempName);
                }
                
                // change the temporary theme's name and put it in the correct spot
                theme.name = name;
                delete THEMES[tempName];
                THEMES[name] = theme;
                
                if (generateStyles) {
                    for (const e of $window.document.querySelectorAll('head > style[nonce]')) {
                        const nonce = e.getAttribute('nonce');
                        if (nonce === tempName) {
                            // replace the temporary theme name in the style contents with the actual theme name
                            e.textContent = e.textContent.replace(new RegExp(tempName, 'g'), name);
                            e.setAttribute('nonce', name);
                        } else if (nonce === name) {
                            // remove old style tags from the same theme
                            e.parentNode.removeChild(e);
                        }
                    }
                }
                
                return theme;
            }

            applyTheme(name) {
                this.activeTheme = name;

                // setup the CSS variables for the theme
                this.applyRootTheme(this.activeTheme);
                
                // activate our new theme
                $mdThemingProvider.setDefaultTheme(this.activeTheme);
                this.addThemeColorMetaTags();

                let themeLogo;
                if (!!this.themes[this.activeTheme].dark === !!this.themes[this.defaultTheme].dark) {
                    themeLogo = this.logoSrc;
                } else {
                    themeLogo = this.alternateLogo;
                }
                this.themeLogo = maUtil.fileStoreUrl(themeLogo || '');
            }
            
            registerTheme(themeName, themeSettings) {
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
            
            getPreferredTheme() {
                const defaultTheme = this.themes[this.defaultTheme];
                const usePreferred = this.usePreferredColorScheme && typeof $window.matchMedia === 'function';
                
                if (usePreferred && $window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    return defaultTheme.dark ? this.defaultTheme : this.alternateTheme;
                } else if (usePreferred && $window.matchMedia('(prefers-color-scheme: light)').matches) {
                    return !defaultTheme.dark ? this.defaultTheme : this.alternateTheme;
                } else {
                    return this.defaultTheme;
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
