/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import momentFilter from './filters/momentFilter';
import durationFilter from './filters/durationFilter';
import angular from 'angular';


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

ngMangoFilters.filter('maMoment', momentFilter);
ngMangoFilters.filter('maDuration', durationFilter);

ngMangoFilters.filter('maSum', function() {
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

ngMangoFilters.filter('maSumColumn', function() {
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

ngMangoFilters.filter('maPad', function() {
	  var zeros = '0000000000';
	  return function(a, b) {
		  return (zeros + a).slice(-b);
	  };
});

ngMangoFilters.filter('maFirst', function() {
	  return function(a) {
		  if (a && typeof a.length === 'number')
			  return a[0];
		  return a;
	  };
});

ngMangoFilters.filter('maUnique', ['maUtil', function(Util) {
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

ngMangoFilters.filter('maRange', function() {
    return function(input, start, end, step) {
        input.splice(0, input.length);
        for (var i = start || 0; i <= (end || 100); i = i + (step || 1))
            input.push(i);
        return input;
    };
});

ngMangoFilters.filter('maProperty', ['maUtil', function(Util) {
    var propertyFilter = Util.memoize(function propertyFilter(input, propertyName) {
        var result = [];
        for (var i = 0; i < input.length; i++)
            result.push(input[i][propertyName]);
        return result;
    });
    
    return function(input, propertyName) {
        if (!input || !Array.isArray(input)) return input;
        return propertyFilter.apply(null, arguments);
    };
}]);

ngMangoFilters.filter('maFilter', ['maUtil', '$filter', function(Util, $filter) {
    return Util.memoize($filter('filter'));
}]);

ngMangoFilters.filter('maNoNaN', function () {
    return function (input, suffix) {
          if (isNaN(input)) { return '\u2014'; }
          else { return input.toFixed(1) + suffix; }
    };
});

ngMangoFilters.filter('maBytes', function() {
	return function(bytes, precision) {
		if (bytes === 0) return '0 B';
		if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
		if (typeof precision === 'undefined') precision = 1;
		var units = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'],
			number = Math.floor(Math.log(bytes) / Math.log(1024));
		if (number === 0) precision = 0;
		return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
	};
});

ngMangoFilters.filter('maMath', ['maMath', function(math) {
    const callFn = (object, fnName, ...args) => {
        if (typeof object[fnName] === 'function') {
            return object[fnName](...args);
        }
        return object[fnName];
    };

    return function(input, ...args) {
        if (!args.length) {
            return input == null ? math : input;
        }
        
        for (let i = 0; i < args.length; i++) {
            if (!Array.isArray(args[i])) {
                args[i] = [args[i]];
            }
        }

        // add the input as the first argument for the function to call
        args[0].splice(1, 0, input);
        
        let result = math;
        args.forEach(fnNameAndArgs => {
            result = callFn(result, ...fnNameAndArgs);
        });
        
        return result;
    };
}]);

ngMangoFilters.filter('maConvertUnit', ['maMath', function(math) {
    return function(input, from, to) {
        if (input == null) return input;
        return math.unit(input, from).toNumber(to);
    };
}]);

ngMangoFilters.filter('maExtractBits', function () {
    return function(input, mask, shift = 0) {
        if (typeof mask === 'string') {
            let radix = mask.substr(0, 2) === '0x' ? 16 : 10;
            mask = parseInt(mask, radix);
        }
        let output = input & mask;
        if (shift > 0) {
            output = output >>> shift;
        } else if (shift < 0) {
            output = output << shift;
        }
        return output;
    };
});

ngMangoFilters.filter('maFindBy', function () {
    return function(input, property, value) {
        if (!Array.isArray(input)) return input;
        return input.find((item) => item[property] === value);
    };
});

ngMangoFilters.filter('maDisplayNull', ['maTranslate', function (maTranslate) {
    const nullStr = maTranslate.trSync('ui.app.null');
    return function(input, strict) {
        if (!strict && input == null || input === null) {
            return nullStr;
        }
        return input;
    };
}]);

export default ngMangoFilters;


