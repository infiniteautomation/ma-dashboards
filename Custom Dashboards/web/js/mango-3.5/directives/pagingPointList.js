/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require', 'angular'], function(require, angular) {
"use strict";

function pagingPointList(Point, $filter, $injector, $parse, $timeout) {
    return {
        restrict: 'E',
        require: 'ngModel',
        scope: {
            ngModel: '=',
            ngChange: '@',
            limit: '=?',
            autoInit: '=?'
        },
        templateUrl: require.toUrl('./pagingPointList.html'),
        link: function ($scope, $element, attrs) {
            
            var DynamicItems = function() {
                this.loadedPages = {};
                this.numItems = 0;
                this.PAGE_SIZE = 20;
                this.fetchPage_(0);
            };

            DynamicItems.prototype.getItemAtIndex = function(index) {
                var pageNumber = Math.floor(index / this.PAGE_SIZE);
                var page = this.loadedPages[pageNumber];
                if (page) {
                    return page[index % this.PAGE_SIZE];
                } else if (page !== null) {
                    this.fetchPage_(pageNumber);
                }
            };

            DynamicItems.prototype.getLength = function() {
                return this.numItems;
            };

            DynamicItems.prototype.fetchPage_ = function(pageNumber) {
                this.loadedPages[pageNumber] = null;
                Point.rql({query: 'limit(' + this.PAGE_SIZE + ',' + pageNumber * this.PAGE_SIZE + ')'})
                .$promise.then(angular.bind(this, function(items) {
                    this.loadedPages[pageNumber] = items;
                    this.numItems = items.$total;
                }));
            };

            $scope.dynamicItems = new DynamicItems();

            if ($scope.autoInit) {
                Point.rql({query: 'limit(1)'}).$promise.then(function(item) {
                    $scope.ngModel = item[0];
                });
            }
            
            var change = $parse(attrs.ngChange);
            $scope.changed = function() {
                $timeout(function() {
                    change($scope.$parent);
                }, 0);
            };
            
            $scope.querySearch = function(queryStr) {
                queryStr = queryStr || '';
                var query = 'or(name=like=*' + queryStr +'*,deviceName=like=*' + queryStr + '*)';
                if (attrs.query) {
                    query += '&' + attrs.query;
                } else {
                    query += '&sort(deviceName,name)&limit(' + ($scope.limit || 200) +')';
                }
                return Point.rql({
                    query: query
                }).$promise.then(null, function() {
                    return [];
                });
            };

            $scope.pointLabel = function(point) {
                return point.deviceName + ' - ' + point.name;
            };
        }
    };
}

pagingPointList.$inject = ['Point', '$filter', '$injector', '$parse', '$timeout'];
return pagingPointList;

}); // define
