/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import requirejs from 'requirejs/require';
import angular from 'angular';
import Globalize from 'globalize';

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
translateFactory.$inject = ['$http', '$q', 'maUser'];
function translateFactory($http, $q, maUser) {
	var Translate = function() {};

	var likelySubtagsUrl = requirejs.toUrl('cldr-data/supplemental/likelySubtags.json');
	Translate.likelySubtags = $http.get(likelySubtagsUrl).then(function(likelySubtags) {
		Globalize.load(likelySubtags.data);
	});

	Translate.tr = function(key) {
		var functionArgs = arguments;
		if (angular.isArray(key)) {
			key = key[0];
		}

        var namespace = key.split('.')[0];
        return Translate.loadNamespaces(namespace).then(function() {
        	return Translate.trSync.apply(null, functionArgs);
        });
	};

	Translate.trSync = function(key, args) {
		if (angular.isArray(key)) {
			args = key;
			key = key.shift();
		} else if (!angular.isArray(args)) {
            args = Array.prototype.slice.call(arguments, 1);
        }
		return Globalize.messageFormatter(key).apply(Globalize, args);
	};

	Translate.loadedNamespaces = {};
    Translate.pendingRequests = {};

	Translate.loadNamespaces = function(namespaces) {
		if (!angular.isArray(namespaces)) {
			namespaces = Array.prototype.slice.call(arguments);
        }

		return this.likelySubtags.then(() => {
			let namespacePromises = namespaces.map(namespace => {
			    let loadedNamespace = this.loadedNamespaces[namespace];
			    if (loadedNamespace) {
			        return $q.when(loadedNamespace);
			    }
			    
                let request = this.pendingRequests[namespace];
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
                        // we know if the user isn't logged in then the locale in the response is the system locale
                        if (!maUser.current) {
                            maUser.setSystemLocale(response.data.locale);
                        }
                        
                        const translations = response.data.translations;
                        
                        // translations will never contain the an entry for language tags with a script
                        // eg zn-Hans-HK or pt-Latn-BR
                        if (!translations[response.data.locale]) {
                            translations[response.data.locale] = {};
                        }

                        Globalize.loadMessages(translations);
                        // locale must be set after messages are loaded
                        this.setLocale(response.data.locale);
                        
                        this.loadedNamespaces[namespace] = response.data;
                        return response.data;
                    }).finally(() => {
                        delete this.pendingRequests[namespace];
                    });

                    this.pendingRequests[namespace] = request;
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

	// Must wait on likelySubtags before calling this
	Translate.setLocale = function(locale) {
	    let globalizeLocale = Globalize.locale();
        if (!globalizeLocale || globalizeLocale.locale !== locale) {
            globalizeLocale = Globalize.locale(locale);
            
            // remove all currently loaded namespaces
            Translate.loadedNamespaces = {};
        }
        return globalizeLocale;
	};
	
	maUser.notificationManager.subscribe((event, newLocale, first) => {
	    // remove all currently loaded namespaces
        Translate.loadedNamespaces = {};
	}, null, ['localeChanged']);

	return Translate;
}

export default translateFactory;


