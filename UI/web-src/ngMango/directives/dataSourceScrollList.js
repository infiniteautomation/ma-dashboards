/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import dataSourceScrollListMdTemplate from './dataSourceScrollList-md.html';
import dataSourceScrollListTemplate from './dataSourceScrollList.html';

dataSourceScrollList.$inject = ['$injector'];
function dataSourceScrollList($injector) {
    const DEFAULT_SORT = ['name'];

    class DataSourceScrollListController {
        static get $$ngIsClass() { return true; }
        static get $inject() { return ['$scope', 'maDataSource']; }
        
        constructor($scope, DataSource) {
            this.$scope = $scope;
            this.DataSource = DataSource;
        }
        
        $onInit() {
            this.ngModelCtrl.$render = () => this.selected = this.ngModelCtrl.$viewValue;

            const xid = this.selectXid;
            if (xid) {
                this.DataSource.get({xid: xid}).$promise.then(null, angular.noop).then(item => {
                    this.setViewValue(item);
                });
            }
            
            this.doQuery().then(items => {
                this.items = items;
                if (!xid && this.selectFirst && items.length) {
                    this.setViewValue(items[0]);
                }
            });
            
            this.DataSource.notificationManager.subscribe((event, item, originalXid) => {
                const index = this.items.findIndex(ds => ds.id === item.id);
                if (index >= 0) {
                    if (event.name === 'update' || event.name === 'create') {
                        this.items[index] = item;
                    } else if (event.name === 'delete') {
                        this.items.splice(index, 1);
                    }
                } else if (event.name === 'update' || event.name === 'create') {
                    this.items.push(item);
                }
            }, this.$scope, ['create', 'update', 'delete']);
        }
        
        $onChanges(changes) {
            if ((changes.query && !changes.query.isFirstChange()) ||
                    (changes.start && !changes.start.isFirstChange()) ||
                    (changes.limit && !changes.limit.isFirstChange()) ||
                    (changes.sort && !changes.sort.isFirstChange())) {
                this.doQuery();
            }
        }
        
        doQuery() {
            this.queryPromise = this.DataSource.objQuery({
                query: this.query,
                start: this.start,
                limit: this.limit,
                sort: this.sort || DEFAULT_SORT
            }).$promise.then(items => {
                return (this.items = items);
            });

            if (this.onQuery) {
                this.onQuery({$promise: this.queryPromise});
            }
            
            return this.queryPromise;
        }
        
        setViewValue(item) {
            this.selected = item;
            this.ngModelCtrl.$setViewValue(item);
        }
        
        createNew(event) {
            this.selected = this.DataSource.createNew();
            this.setViewValue(this.selected);
        }
    }
    
    return {
        restrict: 'E',
        controllerAs: '$ctrl',
        scope: {},
        bindToController: {
            selectXid: '@',
            selectFirst: '<?',
            query: '<?',
            start: '<?',
            limit: '<?',
            sort: '<?',
            onQuery: '&?',
            showNew: '<?'
        },
        template: function() {
            if ($injector.has('$mdUtil')) {
                return dataSourceScrollListMdTemplate;
            }
            return dataSourceScrollListTemplate;
        },
        require: {
            'ngModelCtrl': 'ngModel'
        },
        controller: DataSourceScrollListController,
        designerInfo: {
            translation: 'ui.components.dataSourceScrollList',
            icon: 'playlist_play'
        }
    };
}

export default dataSourceScrollList;