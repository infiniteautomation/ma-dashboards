/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 */

define([], function() {
'use strict';

function maxFilter() {
        return function(input, sparkType) {
              var out;
              if (input) {
                    for (var i in input) {
                          var compare;
                          if (sparkType == "val") {
                                if (input[i].val < 0) {
                                      compare = input[i].val * -1;
                                } else {
                                      compare = input[i].val;
                                }
                                if (compare > out || out === undefined || out === null) {
                                      out = compare;
                                }
                          } else if (sparkType == "min") {
                                if (input[i].min < 0) {
                                      compare = input[i].min * -1;
                                } else {
                                      compare = input[i].min;
                                }
                                if (compare > out || out === undefined || out === null) {
                                      out = compare;
                                }
                          } else if (sparkType == "max") {
                                if (input[i].max < 0) {
                                      compare = input[i].max * -1;
                                } else {
                                      compare = input[i].max;
                                }
                                if (compare > out || out === undefined || out === null) {
                                      out = compare;
                                }
                          } else if (sparkType == "avg") {
                                if (input[i].avg < 0) {
                                      compare = input[i].avg * -1;
                                } else {
                                      compare = input[i].avg;
                                }
                                if (compare > out || out === undefined || out === null) {
                                      out = compare;
                                }
                          } else if (sparkType == "sum") {
                                if (input[i].sum < 0) {
                                      compare = input[i].sum * -1;
                                } else {
                                      compare = input[i].sum;
                                }
                                if (compare > out || out === undefined || out === null) {
                                      out = compare;
                                }
                          }
                    }
              }
              return out;
        };
  };

return maxFilter;

}); // define
