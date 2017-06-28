/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require', 'angular', 'globalize', 'globalize/message', 'cldr/unresolved'], function(require, angular, Globalize) {
'use strict';
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
function translateFactory($http, $q) {
	var Translate = function() {};

	var likelySubtagsUrl = require.toUrl('cldr-data/supplemental/likelySubtags.json');
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

	Translate.loadNamespaces = function(namespaces) {
		if (!angular.isArray(namespaces)) {
			namespaces = Array.prototype.slice.call(arguments);
        }

		return Translate.likelySubtags.then(function() {
			var namespaceRequests = [];
			for (var i = 0; i < namespaces.length; i++) {
				var namespace = namespaces[i];
				var request = Translate.loadedNamespaces[namespace];
				if (!request) {
					var translationsUrl = '/rest/v1/translations/';
					if (namespace === 'public' || namespace === 'login' || namespace === 'header') {
						translationsUrl += 'public/';
					}

					request = $http.get(translationsUrl + encodeURIComponent(namespace), {
						params: {
							//language: 'en-US',
						    //server: true,
						    //browser: true
						}
					});
					request.then(null, removeFromLoaded.bind(null, namespace));
					Translate.loadedNamespaces[namespace] = request;
				}
				namespaceRequests.push(request);
			}
			return $q.all(namespaceRequests);
		}).then(function(result) {
		    var allData = {};
			for (var i = 0; i < result.length; i++) {
				var data = result[i].data;
				angular.merge(allData, data);
				if (!data.loaded) {
					Globalize.loadMessages(data.translations);
					data.loaded = true;
				}
				// use server returned language
				if (!Globalize.locale()) {
					Globalize.locale(data.locale);
				}
			}
			return allData;
		});
	};

	function removeFromLoaded(namespace) {
		delete Translate.loadedNamespaces[namespace];
	}

	return Translate;
}

translateFactory.$inject = ['$http', '$q'];

return translateFactory;

}); // define
