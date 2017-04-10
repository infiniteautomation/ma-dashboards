/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['./filters/momentFilter',
        './filters/durationFilter',
        'angular'
], function(momentFilter, durationFilter, angular) {
'use strict';

var maFilters = angular.module('maFilters', []);

maFilters.filter('moment', momentFilter);
maFilters.filter('duration', durationFilter);

maFilters.filter('sum', function() {
	return function(arrayData, propName) {
		var sum = 0;
		var val;
		if (!arrayData) return null;
		if (arrayData.length !== undefined) {
			for (var i = 0; i < arrayData.length; i++) {
				if (arrayData[i] !== undefined) {
					val = arrayData[i];
					if (!propName) {
						sum += val;
					} else if (val[propName]) {
						sum += val[propName];
					}
				}
			}
		} else {
			for (var key in arrayData) {
				if (arrayData[key] !== undefined) {
					val = arrayData[key];
					if (!propName) {
						sum += val;
					} else if (val[propName]) {
						sum += val[propName];
					}
				}
			}
		}
		return sum;
	};
});

maFilters.filter('sumColumn', function() {
	return function(tableData, colNum) {
		var sum = 0;
		if (!tableData) {
			return sum;
		}
		if (tableData.length !== undefined) {
			for (var i = 0; i < tableData.length; i++) {
				if (tableData[i] && tableData[i][colNum] !== undefined)
					sum += tableData[i][colNum];
			}
		} else {
			for (var key in tableData) {
				if (tableData[key] && tableData[key][colNum] !== undefined)
					sum += tableData[key][colNum];
			}
		}
		return sum;
	};
});

maFilters.filter('pad', function() {
	  var zeros = '0000000000';
	  return function(a, b) {
		  return (zeros + a).slice(-b);
	  };
});

maFilters.filter('first', function() {
	  return function(a) {
		  if (a && typeof a.length === 'number')
			  return a[0];
		  return a;
	  };
});

maFilters.filter('unique', function() {
	
	function addUnique(result, item, propName) {
		var propValue = item[propName];
		if (result.indexOf(propValue) >= 0) return;
		result.push(propValue);
	}
	
	return function(collection, propName) {
		if (!collection) return;
		var result = [];
		if (collection.length !== undefined) {
			for (var i = 0; i < collection.length; i++)
				addUnique(result, collection[i], propName);
		} else {
			for (var key in collection)
				addUnique(result, collection[key], propName);
		}
		return result;
	};
});

return maFilters;

}); // require
