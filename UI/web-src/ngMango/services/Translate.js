/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */
import angular from 'angular';
import Globalize from 'globalize';
import likelySubtags from 'cldr-data/supplemental/likelySubtags.json';
import plurals from 'cldr-data/supplemental/plurals.json';

/**
* @ngdoc service
* @name ngMangoServices.maTranslate
*
* @description
* `Translate` service provides internationalization support.
*
* # Usage
*
* <pre prettyprint-mode="javascript">
    text = Translate.trSync(key, args);
* </pre>
*/ 

/**
* @ngdoc method
* @methodOf ngMangoServices.maTranslate
* @name tr
*
* @description
* REPLACE
* @param {object} key REPLACE
* @param {object} args REPLACE
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maTranslate
* @name trSync
*
* @description
* REPLACE
* @param {object} key REPLACE
* @param {object} args REPLACE
*
*/

/**
* @ngdoc method
* @methodOf ngMangoServices.maTranslate
* @name loadNamespaces
*
* @description
* REPLACE
* @param {object} namespaces REPLACE
*
*/

function translateProvider() {

    Globalize.load(likelySubtags);
    Globalize.load(plurals);
    
    const loadedNamespaces = {};
    const pendingRequests = {};

    this.loadTranslations = loadTranslations;
    this.setLocale = setLocale;
    this.$get = translateFactory;
    
    function setLocale(locale) {
        let globalizeLocale = Globalize.locale();
        if (!globalizeLocale || globalizeLocale.locale !== locale) {
            globalizeLocale = Globalize.locale(locale);
            
            // remove all currently loaded namespaces
            clearLoadedNamespaces();
        }
        return globalizeLocale;
    }
    
    function clearLoadedNamespaces() {
        Object.keys(loadedNamespaces).forEach(key => delete loadedNamespaces[key]);
    }
    
    function loadTranslations(data) {
        const namespaces = data.namespaces;
        const translations = data.translations;
        const locale = data.locale;
        
        // translations will never contain the an entry for language tags with a script
        // eg zn-Hans-HK or pt-Latn-BR
        if (!translations[locale]) {
            translations[locale] = {};
        }

        Globalize.loadMessages(translations);
        
        // locale must be set after messages are loaded
        setLocale(locale);
        
        namespaces.forEach(namespace => loadedNamespaces[namespace] = translations);
    }

    translateFactory.$inject = ['$http', '$q', 'maUser'];
    function translateFactory($http, $q, maUser) {
        const Translate = function() {};

        Translate.tr = function(key) {
            const functionArgs = arguments;
            if (Array.isArray(key)) {
                key = key[0];
            }

            const namespace = key.split('.')[0];
            return Translate.loadNamespaces(namespace).then(function() {
                return Translate.trSync.apply(null, functionArgs);
            });
        };

        Translate.trSync = function(key, args) {
            if (Array.isArray(key)) {
                args = key;
                key = key.shift();
            } else if (!Array.isArray(args)) {
                args = Array.prototype.slice.call(arguments, 1);
            }
            return Globalize.messageFormatter(key).apply(Globalize, args);
        };


        Translate.loadNamespaces = function(namespaces) {
            if (!Array.isArray(namespaces)) {
                namespaces = Array.prototype.slice.call(arguments);
            }

            return $q.resolve().then(() => {
                let namespacePromises = namespaces.map(namespace => {
                    let loadedNamespace = loadedNamespaces[namespace];
                    if (loadedNamespace) {
                        return $q.when(loadedNamespace);
                    }
                    
                    let request = pendingRequests[namespace];
                    if (!request) {
                        let translationsUrl = '/rest/v1/translations/';
                        if (namespace === 'public' || namespace === 'login' || namespace === 'header') {
                            translationsUrl += 'public/';
                        }

                        request = $http.get(translationsUrl + encodeURIComponent(namespace), {
                            params: {
                                //language: 'en-US',
                                //server: true,
                                //browser: true
                            }
                        }).then(response => {
                            loadTranslations(response.data);
                            return response.data;
                        }).finally(() => {
                            delete pendingRequests[namespace];
                        });

                        pendingRequests[namespace] = request;
                    }
                    return request;
                });
                return $q.all(namespacePromises);
            }).then(function(result) {
                const allData = {};
                
                result.forEach(data => {
                    angular.merge(allData, data);
                });

                return allData;
            });
        };

        Translate.setLocale = setLocale;
        Translate.loadTranslations = loadTranslations;
        
        maUser.notificationManager.subscribeLocal((event, newLocale, first) => {
            let globalizeLocale = Globalize.locale();
            if (!globalizeLocale || globalizeLocale.locale !== newLocale) {
                // clear the translation namespace cache if the user's locale changes
                clearLoadedNamespaces();
            }
        }, null, ['localeChanged']);

        return Translate;
    }
}

export default translateProvider;
