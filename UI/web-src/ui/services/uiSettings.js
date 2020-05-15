/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import defaultUiSettings from '../uiSettings.json';

uiSettingsProvider.$inject = ['$mdThemingProvider', 'maPointValuesProvider', 'MA_TIMEOUTS'];
function uiSettingsProvider($mdThemingProvider, pointValuesProvider, MA_TIMEOUTS) {

    // md-theme attribute on the body is still watched as it is a interpolated attribute
    $mdThemingProvider.alwaysWatchTheme(false);
    // register the themes but dont generate the style tags for them until they are used
    $mdThemingProvider.generateThemesOnDemand(true);
    
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
    };

    this.$get = uiSettingsFactory;

    uiSettingsFactory.$inject = [
        'maJsonStore',
        '$mdTheming',
        '$MD_THEME_CSS',
        '$mdColors',
        'maCssInjector',
        '$templateRequest',
        'MA_UI_SETTINGS_XID',
        'MA_UI_EDIT_SETTINGS_PERMISSION',
        '$window',
        'maPointValues',
        '$rootScope',
        'maUtil'];
    function uiSettingsFactory(
            JsonStore,
            $mdTheming,
            MD_THEME_CSS,
            $mdColors,
            maCssInjector,
            $templateRequest,
            MA_UI_SETTINGS_XID,
            MA_UI_EDIT_SETTINGS_PERMISSION,
            $window,
            maPointValues,
            $rootScope,
            maUtil) {

        if (MA_UI_SETTINGS.userCss) {
            // inject after <meta name="user-styles-after-here">
            maCssInjector.injectLink(MA_UI_SETTINGS.userCss, 'userCss', 'head > meta[name="user-styles-after-here"]');
        }
        
        // contains fix for https://github.com/angular/material/issues/10516
        const userAgent = $window.navigator.userAgent;
        if (userAgent.indexOf('Mac OS X') >= 0 && userAgent.indexOf('Safari/') >= 0 &&
                userAgent.indexOf('Chrome/') < 0 && userAgent.indexOf('Chromium/') < 0) {
            // assign to variable to stop other warnings
            // jshint unused:false
            const safariCss = import(/* webpackChunkName: "ui.safari" */ '../styles/safari.css');
        }

        const excludeProperties = ['userSettingsStore', 'activeTheme', 'userModuleName', 'mangoModuleNames', 'activeThemeObj', 'themeLogo'];
        const palettes = ['primary', 'accent', 'warn', 'background'];
        const hues = ['default', 'hue-1', 'hue-2', 'hue-3', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', 'A100', 'A200', 'A400', 'A700'];
        const foregroundHues = ['1', '2', '3', '4'];
        
        const allHues = palettes.map(palette => {
            return hues.map(hue => {
                return {
                    palette,
                    hue,
                    colorString: hue === 'default' ? palette : `${palette}-${hue}`
                };
            });
        }).reduce((acc, h) => {
            return acc.concat(h);
        });
        
        class UiSettings {
            constructor() {
                angular.extend(this, angular.copy(MA_UI_SETTINGS));

                this.userSettingsStore = new JsonStore();
                this.userSettingsStore.name = 'UI Settings';
                this.userSettingsStore.xid = MA_UI_SETTINGS_XID;
                this.userSettingsStore.jsonData = deepDiff(this, defaultUiSettings, excludeProperties);
                this.userSettingsStore.publicData = true;
                this.userSettingsStore.readPermission = '';
                this.userSettingsStore.editPermission = MA_UI_EDIT_SETTINGS_PERMISSION;
                
                // watch for changes to the user's preferred color scheme
                if (typeof $window.matchMedia === 'function') {
                    $window.matchMedia('(prefers-color-scheme: light), (prefers-color-scheme: no-preference)').addEventListener('change', event => {
                        $rootScope.$apply(() => {
                            this.applyUiSettings();
                        });
                    });
                }
                
                this.applyUiSettings();
            }

            save() {
                if (this.pwaUseThemeColors) {
                    /* jshint camelcase: false */
                    this.pwaManifest.theme_color = $mdColors.getThemeColor('primary-800');
                    this.pwaManifest.background_color = $mdColors.getThemeColor('background');
                }
                
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
                    return store;
                });
            }
            
            // revert on ui settings page
            reset() {
                angular.merge(this, defaultUiSettings);
                angular.merge(this, this.userSettingsStore.jsonData);
            }
            
            'delete'() {
                this.userSettingsStore.jsonData = {};
                return this.userSettingsStore.$save().then(store => {
                    this.reset();
                    this.applyUiSettings();
                });
            }
            
            applyUiSettings() {
                this.applyPreferredColorScheme();
                this.generateTheme();
                Object.assign(MA_TIMEOUTS, this.timeouts);
                this.setPointValuesLimit();
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
                this.applyRootTheme();
                
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
            
            getThemeColor(options) {
                let {theme, palette, hue} = options;

                const scheme = $mdTheming.THEMES[theme].colors[palette];
                if (scheme.hues[hue]) {
                    hue = scheme.hues[hue];
                }
                const paletteObj = $mdTheming.PALETTES[scheme.name];
                return paletteObj[hue];
            }
            
            getCssVariables(theme) {
                const properties = [
                    {name: '--ma-font-default', value: this.fonts.default},
                    {name: '--ma-font-paragraph', value: this.fonts.paragraph},
                    {name: '--ma-font-heading', value: this.fonts.heading},
                    {name: '--ma-font-code', value: this.fonts.code}
                ];
                
                allHues.map(x => {
                    const color = this.getThemeColor(Object.assign({theme}, x));
                    return Object.assign({}, color, x);
                }).forEach(color => {
                    const value = color.value.join(',');
                    const contrast = color.contrast.join(',');
                    properties.push({name: `--ma-${color.colorString}`, value: `rgb(${value})`});
                    properties.push({name: `--ma-${color.colorString}-contrast`, value: `rgba(${contrast})`});
                    properties.push({name: `--ma-${color.colorString}-value`, value: value});
                });
                
                foregroundHues.forEach(hue => {
                    properties.push({name: `--ma-foreground-${hue}`, value: $mdTheming.THEMES[theme].foregroundPalette[hue]});
                });
                properties.push({name: '--ma-foreground-value', value: $mdTheming.THEMES[theme].isDark ? '255,255,255' : '0,0,0'});
                
                return properties;
            }
            
            themeElement(element, theme = this.activeTheme) {
                if (theme) {
                    const properties = this.getCssVariables(theme);
                    properties.forEach(property => {
                        element.style.setProperty(property.name, property.value);
                    });
                } else {
                    // remove theme
                    element.style.removeProperty('--ma-font-default');
                    element.style.removeProperty('--ma-font-paragraph');
                    element.style.removeProperty('--ma-font-heading');
                    element.style.removeProperty('--ma-font-code');
                    allHues.forEach(x => {
                        element.style.removeProperty(`--ma-${x.colorString}`);
                        element.style.removeProperty(`--ma-${x.colorString}-contrast`);
                        element.style.removeProperty(`--ma-${x.colorString}-value`);
                    });
                    foregroundHues.forEach(hue => {
                        element.style.removeProperty(`--ma-foreground-${hue}`);
                    });
                    element.style.removeProperty(`--ma-foreground-value`);
                }
                this.setThemeClasses(element, theme);
            }
            
            applyRootTheme(theme = this.activeTheme) {
                const properties = this.getCssVariables(theme);
                const styles = ':root {\n' + properties.map(p => `${p.name}: ${p.value};`).join('\n') + '\n}';
                maCssInjector.injectStyle(styles, 'ma-variables', 'head > meta[name="user-styles-after-here"]', true);

                this.setThemeClasses($window.document.body, theme);
            }
            
            setThemeClasses(element, theme = this.activeTheme) {
                element.classList.remove('ma-theme-dark');
                element.classList.remove('ma-theme-light');
                if (theme) {
                    const themeObj = $mdTheming.THEMES[theme];
                    element.classList.add(themeObj.isDark ? 'ma-theme-dark' : 'ma-theme-light');
                }
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
                const usePreferred = this.usePreferredColorScheme && typeof $window.matchMedia === 'function';
                if (usePreferred && $window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    this.themeLogo = this.darkLogo;
                    this.activeTheme = this.darkTheme;
                } else if (usePreferred && $window.matchMedia('(prefers-color-scheme: light)').matches) {
                    this.themeLogo = this.lightLogo;
                    this.activeTheme = this.lightTheme;
                } else {
                    this.themeLogo = this.logoSrc;
                    this.activeTheme = this.defaultTheme;
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
