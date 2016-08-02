/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Will Geller
 */

define(['require'], function(require) {
'use strict';

var watchListTable = function($mdMedia) {
        return {
              restrict: 'E',
              scope: {
                    data: '=',
                    to: '=',
                    from: '=',
                    selected: '='
              },
              templateUrl: 'directives/watchList/watchListTable.html',
              link: function link(scope, element, attrs) {

                    scope.parseInt = parseInt; // Make parseInt availble to scope
                    scope.parseFloat = parseFloat; // Make parseFloat availble to scope
                    scope.stats = []; // Set up array for storing stats
                    scope.page.points = [];
                    scope.page.searchQuery = "name=like=*"+scope.data.type+"*&name=like=*"+scope.data.mode+"*";
                    scope.sparkType = 'val';



                    scope.$mdMedia = $mdMedia;

                    scope.$watch('page.points', function(newValue, oldValue) {
                          if (newValue === undefined || newValue === oldValue) return;
                          //`console.log('Table Points', newValue);

                          scope.stats = [];
                    });

                    // Allows changing of sorting on stat to effect sparkLine data
                    scope.$watch('page.tableOrder', function(newValue, oldValue) {
                          if (newValue === undefined || newValue === oldValue) return;

                          //console.log('page.tableOrder', newValue);

                          if (newValue == 'val' || newValue == '-val') {
                                scope.sparkType = 'val';
                          } else if (newValue == 'avg' || newValue == '-avg') {
                                scope.sparkType = 'avg';
                          } else if (newValue == 'avg' || newValue == '-avg') {
                                scope.sparkType = 'avg';
                          } else if (newValue == 'avgprm' || newValue == '-avgprm') {
                                scope.sparkType = 'avgprm';
                          } else if (newValue == 'min' || newValue == '-min') {
                                scope.sparkType = 'min';
                          }else if (newValue == 'max' || newValue == '-max') {
                                scope.sparkType = 'max';
                          } else if (newValue == 'sum' || newValue == '-sum') {
                                scope.sparkType = 'sum';
                          } else if (newValue == 'delta' || newValue == '-delta') {
                                scope.sparkType = 'delta';
                          } else if (newValue == 'deltaRoom' || newValue == '-deltaRoom') {
                                scope.sparkType = 'deltaRoom';
                          }
                    });

                    // Changing of resource unit triggers new search query on table by match on point name
                    scope.$watch('data.type', function(newValue, oldValue) {

                          if (newValue === undefined || newValue === oldValue) return;
                          //console.log('Type changed to:', newValue);

                          // Clear points
                          scope.stats = [];
                          scope.page.points = [];

                          // Update the serach query with the new data.type (power,energy...)
                          if (newValue!='water+') {
                                scope.page.searchQuery = "name=like=*"+scope.data.type+"*&name=like=*"+scope.data.mode+"*";
                          }
                          else {
                                scope.page.searchQuery = "name=like=*"+'hot/cold'+"*&name=like=*"+scope.data.mode+"*";
                          }

                    });

                    // Changing of building mode triggers new search query on table by match on point name
                    scope.$watch('data.mode', function(newValue, oldValue) {

                          if (newValue === undefined || newValue === oldValue) return;
                          //console.log('Mode changed to:', newValue);

                          // Clear points
                          scope.stats = [];
                          scope.page.points = [];

                          // Update the serach query with the new building mode
                          if (scope.data.type!='water+') {
                                scope.page.searchQuery = "name=like=*"+scope.data.type+"*&name=like=*"+scope.data.mode+"*";
                          }
                          else {
                                scope.page.searchQuery = "name=like=*"+'hot/cold'+"*&name=like=*"+scope.data.mode+"*";
                          }
                    });
              }
        };
  };

watchListTable.$inject = ['$mdMedia'];

return watchListTable;

}); // define
