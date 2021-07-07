/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

maThemingProvider.$inject = ['$injector'];
function maThemingProvider($injector) {

    this.$get = maThemingFactory;
    
    maThemingFactory.$inject = [];
    function maThemingFactory() {
        
        // no hard dep, may want to move away from $mdTheming
        const $mdThemingProvider = $injector.has('$mdThemingProvider') && $injector.get('$mdThemingProvider');
        const THEMES = $mdThemingProvider ? $mdThemingProvider._THEMES : {};
        const PALETTES = $mdThemingProvider ? $mdThemingProvider._PALETTES : {};
        
        const paletteNames = ['primary', 'accent', 'warn', 'background'];
        const hueNames = ['default', 'hue-1', 'hue-2', 'hue-3', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', 'A100', 'A200', 'A400', 'A700'];
        const foregroundHues = ['1', '2', '3', '4'];
        
        const allHues = paletteNames.map(palette => {
            return hueNames.map(hue => {
                return {
                    palette,
                    hue,
                    colorString: hue === 'default' ? palette : `${palette}-${hue}`
                };
            });
        }).reduce((acc, h) => {
            return acc.concat(h);
        });
        
        class ThemeService {
            
            getThemeColor(options) {
                let {theme, palette, hue} = options;

                const scheme = THEMES[theme].colors[palette];
                if (scheme.hues[hue]) {
                    hue = scheme.hues[hue];
                }
                const paletteObj = PALETTES[scheme.name];
                return paletteObj[hue];
            }
            
            getThemeColors(options) {
                const color = this.getThemeColor(options);
                return {
                    color: color.hex.toUpperCase(),
                    contrast: `rgba(${color.contrast.join(',')})`
                };
            }
            
            getCssVariables(theme) {
                const properties = [];
                
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
                    properties.push({name: `--ma-foreground-${hue}`, value: THEMES[theme].foregroundPalette[hue]});
                });
                properties.push({name: '--ma-foreground-value', value: THEMES[theme].isDark ? '255,255,255' : '0,0,0'});
                
                return properties;
            }
            
            themeElement(element, theme) {
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

            setThemeClasses(element, theme) {
                element.classList.remove('ma-theme-dark');
                element.classList.remove('ma-theme-light');
                if (theme) {
                    const themeObj = THEMES[theme];
                    element.classList.add(themeObj.isDark ? 'ma-theme-dark' : 'ma-theme-light');
                }
            }
            
            getPaletteNames() {
                return paletteNames;
            }
            
            getHueNames() {
                return hueNames;
            }
            
            getThemes() {
                return THEMES;
            }
            
            getPalettes() {
                return PALETTES;
            }

            defaultTheme() {
                return {
                    primaryPalette: 'indigo',
                    primaryPaletteHues: {'default': '500', 'hue-1': '300', 'hue-2': '800', 'hue-3': 'A100'},
                    accentPalette: 'pink',
                    accentPaletteHues: {'default': 'A200', 'hue-1': 'A100', 'hue-2': 'A400', 'hue-3': 'A700'},
                    warnPalette: 'deep-orange',
                    warnPaletteHues: {'default': '500', 'hue-1': '300', 'hue-2': '800', 'hue-3': 'A100'},
                    backgroundPalette: 'grey',
                    backgroundPaletteHues: {'default': '50', 'hue-1': 'A100', 'hue-2': '100', 'hue-3': '300'},
                    dark: false
                };
            }
        }
        
        return new ThemeService();
    }
}

export default maThemingProvider;