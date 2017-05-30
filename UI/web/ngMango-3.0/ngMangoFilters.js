/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['./filters/momentFilter',
        './filters/durationFilter',
        'angular'
], function(momentFilter, durationFilter, angular) {
'use strict';
/**
 * @ngdoc overview
 * @name ngMangoFilters
 *
 *
 * @description
 * The ngMangoFilters module handles loading of the custom filters used for formatting and manipulating data in
   a Mango 3.0 dashboard.
 *
 *
 **/
var ngMangoFilters = angular.module('ngMangoFilters', []);

ngMangoFilters.filter('moment', momentFilter);
ngMangoFilters.filter('duration', durationFilter);

ngMangoFilters.filter('sum', function() {
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

ngMangoFilters.filter('sumColumn', function() {
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

ngMangoFilters.filter('pad', function() {
	  var zeros = '0000000000';
	  return function(a, b) {
		  return (zeros + a).slice(-b);
	  };
});

ngMangoFilters.filter('first', function() {
	  return function(a) {
		  if (a && typeof a.length === 'number')
			  return a[0];
		  return a;
	  };
});

ngMangoFilters.filter('unique', ['Util', function(Util) {
	var uniqueFilter = Util.memoize(function uniqueFilter(collection, propName) {
	    
	    var result = [];
	    
        if (collection.length !== undefined) {
            for (var i = 0; i < collection.length; i++)
                addUnique(collection[i]);
        } else {
            for (var key in collection)
                addUnique(collection[key]);
        }
        
        return result;

        function addUnique(item) {
            var propValue = item[propName];
            if (result.indexOf(propValue) >= 0) return;
            result.push(propValue);
        }
	});

	return function(collection, propName) {
		if (!collection) return collection;
		return uniqueFilter.apply(null, arguments);
	};
}]);

ngMangoFilters.filter('range', function() {
    return function(input, start, end, step) {
        input.splice(0, input.length);
        for (var i = start || 0; i <= (end || 100); i = i + (step || 1))
            input.push(i);
        return input;
    };
});

ngMangoFilters.filter('property', ['Util', function(Util) {
    var propertyFilter = Util.memoize(function propertyFilter(input, propertyName) {
        var result = [];
        for (var i = 0; i < input.length; i++)
            result.push(input[i][propertyName]);
        return result;
    });
    
    return function(input, propertyName) {
        if (!input || !angular.isArray(input)) return input;
        return propertyFilter.apply(null, arguments);
    };
}]);

ngMangoFilters.filter('maFilter', ['Util', '$filter', function(Util, $filter) {
    return Util.memoize($filter('filter'));
}]);

ngMangoFilters.filter('noNaN', function () {
    return function (input, suffix) {
          if (isNaN(input)) { return '\u2014'; }
          else { return input.toFixed(1) + suffix; }
    };
});

return ngMangoFilters;

}); // require
