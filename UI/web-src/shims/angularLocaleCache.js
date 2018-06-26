/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

class LocaleCache {
    constructor() {
        this.cache = {};
    }
    
    /**
     * angular.module()
     */
    module(name, requires, configFn) {
        if (name === 'ngLocale' && Array.isArray(configFn) && configFn.length === 2 &&
                configFn[0] === '$provide' && typeof configFn[1] === 'function') {
            configFn[1](this);
        } else {
            console.warn('Tried to use fake angular.module() function', name, requires, configFn);
        }
    }
    
    /**
     * $provide.value()
     */
    value(name, value) {
        if (name === '$locale') {
            this.cache[value.id] = value;
        } else {
            console.warn('Tried to use fake $provide.value() function', name, value);
        }
    }
    
    getLocale(localeId) {
        const cachedLocale = this.cache[localeId];
        if (cachedLocale) {
            return Promise.resolve(cachedLocale);
        }
        
        const importPromise = import(/* webpackMode: "lazy-once", webpackChunkName: "angular-i18n" */
                'angular-i18n/angular-locale_' + localeId);
        
        return importPromise.then(() => {
            const localeData = this.cache[localeId];
            if (!localeData) {
                return Promise.reject('Locale not found / error loading');
            }
            return localeData;
        });
    }
}

const localeCache = new LocaleCache();
export default localeCache;
