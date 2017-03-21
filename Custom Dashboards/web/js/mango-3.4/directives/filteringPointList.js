/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require', 'rql/query'], function(require, query) {
'use strict';
/**
 * @ngdoc directive
 * @name maDashboards.maFilteringPointList
 * @restrict E
 * @description
 * `<ma-filtering-point-list ng-model="myPoint"></ma-filtering-point-list>`
 * - Creates a self-filtering point list that allows you to select a data point by filtering on device names or point names that contain the text.
     Search results will update as you type.
 * - <a ui-sref="dashboard.examples.basics.pointList">View Demo</a>
 *
 * @param {object} ng-model Variable to hold the selected data point.
 * @param {number=} limit Limits the results in the list to a specified number of data points (200 defualt)
 * @param {boolean=} auto-init If set, enables auto selecting of the first data point in the list.
 * @param {string=} point-xid Used with `auto-init` to pre-select the specified point by xid. 
 * @param {string=} point-id Used with `auto-init` to pre-select the specified point by data point id. 
 
 *
 * @usage
 * <ma-filtering-point-list ng-model="myPoint"></ma-filtering-point-list>
 */
filteringPointList.$inject = [];
function filteringPointList() {
    return {
        restrict: 'E',
        templateUrl: require.toUrl('./filteringPointList.html'),
        scope: {},
        controller: FilteringPointListController,
        controllerAs: '$ctrl',
        bindToController: {
            limit: '<?',
            autoInit: '<?',
            pointXid: '@?',
            pointId: '<?',
            query: '@?',
            label: '@?',
            listText: '&?',
            displayText: '&?',
            clientSideFilter: '<?'
        },
        require: {
            ngModelCtrl: 'ngModel'
        },
        designerInfo: {
            translation: 'dashboards.v3.components.filteringPointList',
            icon: 'filter_list',
            category: 'dropDowns'
        }
    };
}

FilteringPointListController.$inject = ['Point', '$filter', 'Translate'];
function FilteringPointListController(Point, $filter, Translate) {
    this.Point = Point;
    this.$filter = $filter;
    this.Translate = Translate;
}

FilteringPointListController.prototype.$onChanges = function(changes) {
    if (changes.pointXid && (changes.pointXid.currentValue || !changes.pointXid.isFirstChange())) {
        this.setByXid();
    }
    
    if (changes.pointId && (changes.pointId.currentValue || changes.pointId.currentValue === 0 || !changes.pointId.isFirstChange())) {
        this.setById();
    }
};

FilteringPointListController.prototype.$onInit = function() {
    this.ngModelCtrl.$render = this.render.bind(this);
    
    if (!this.label)
        this.label = this.Translate.trSync('dashboards.v3.app.searchBy', 'points', 'name or device');
    
    if (this.autoInit) {
        if (!this.pointXid && !(this.pointId || this.pointId === 0)) {
            this.Point.rql({query: 'limit(1)'}).$promise.then(function(items) {
                if (items.length) {
                    this.setViewValue(items[0]);
                }
            }.bind(this));
        }
    }

    if (!this.listText) {
        this.listText = defaultText;
    }
    
    if (!this.displayText) {
        this.displayText = defaultText;
    }
    
    function defaultText(opts) {
        return opts.$point.deviceName + ' - ' + opts.$point.name;
    }
};

FilteringPointListController.prototype.render = function() {
    this.selectedItem = this.ngModelCtrl.$viewValue || null;
};

FilteringPointListController.prototype.setViewValue = function(point) {
    if (point) {
        this.selectedItem = point;
    }
    this.ngModelCtrl.$setViewValue(this.selectedItem);
};

FilteringPointListController.prototype.querySearch = function(inputText) {
    var rqlQuery, queryString = '';
    
    if (inputText) {
        rqlQuery = new query.Query();
        var nameLike = new query.Query({name: 'like', args: ['name', '*' + inputText + '*']});
        var deviceName = new query.Query({name: 'like', args: ['deviceName', '*' + inputText + '*']});
        rqlQuery.push(nameLike);
        rqlQuery.push(deviceName);
        rqlQuery.name = 'or';
    }

    if (this.query) {
        if (rqlQuery) {
            queryString = rqlQuery.toString();
        }
        queryString = queryString + this.query;
    } else {
        var q = new query.Query();
        if (rqlQuery)
            q.push(rqlQuery);

        queryString = q.sort('deviceName', 'name')
            .limit(this.limit || 150)
            .toString();
    }
    
    return this.Point.rql({
        rqlQuery: queryString
    }).$promise.then(function(result) {
        if (this.clientSideFilter) {
            return this.$filter('filter')(result, this.clientSideFilter);
        } else {
            return result;
        }
    }.bind(this), function() {
        return [];
    });
};

FilteringPointListController.prototype.setByXid = function() {
    if (this.pointXid) {
        this.Point.get({xid: this.pointXid}).$promise.then(function(item) {
            this.setViewValue(item);
        }.bind(this));
    } else {
        this.setViewValue(null);
    }
};

FilteringPointListController.prototype.setById = function() {
    if (this.pointId || this.pointId === 0) {
        this.Point.getById({id: this.pointId}).$promise.then(function(item) {
            this.setViewValue(item);
        }.bind(this));
    } else {
        this.setViewValue(null);
    }
};

return filteringPointList;

}); // define
