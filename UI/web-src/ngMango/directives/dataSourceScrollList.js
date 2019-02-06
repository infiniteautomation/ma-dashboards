/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import dataSourceScrollListMdTemplate from './dataSourceScrollList-md.html';
import dataSourceScrollListTemplate from './dataSourceScrollList.html';
import './dataSourceScrollList.css';

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
                if (!xid && this.selectFirst && items.length) {
                    this.setViewValue(items[0]);
                }
            });
            
            this.DataSource.notificationManager.subscribe((event, item, originalXid) => {
                const index = this.preFilterItems.findIndex(ds => ds.id === item.id);
                if (index >= 0) {
                    if (event.name === 'update' || event.name === 'create') {
                        this.preFilterItems[index] = item;
                    } else if (event.name === 'delete') {
                        this.preFilterItems.splice(index, 1);
                    }
                } else if (event.name === 'update' || event.name === 'create') {
                    this.preFilterItems.push(item);
                }
                this.filterList();
            }, this.$scope, ['create', 'update', 'delete']);
        }
        
        $onChanges(changes) {
            if ((changes.query && !changes.query.isFirstChange()) ||
                    (changes.start && !changes.start.isFirstChange()) ||
                    (changes.limit && !changes.limit.isFirstChange()) ||
                    (changes.sort && !changes.sort.isFirstChange())) {
                this.doQuery();
            }
            if (changes.filter && !changes.filter.isFirstChange()) {
                this.filterList();
            }
        }
        
        doQuery() {
            if (this.filter || (this.query == null && this.start == null && this.limit == null && this.sort == null)) {
                return this.doFilterQuery();
            }
            
            // legacy query mode
            const queryPromise = this.DataSource.objQuery({
                query: this.query,
                start: this.start,
                limit: this.limit,
                sort: this.sort || DEFAULT_SORT
            }).$promise.then(items => {
                this.preFilterItems = items;
                return this.filterList();
            }).finally(() => {
                if (this.queryPromise === queryPromise) {
                    delete this.queryPromise;
                }
            });
            
            this.queryPromise = queryPromise;

            if (this.onQuery) {
                this.onQuery({$promise: this.queryPromise});
            }
            
            return this.queryPromise;
        }
        
        doFilterQuery() {
            const queryPromise = this.DataSource.buildQuery()
                .sort('name')
                .limit(1000)
                .query()
                .then(items => {
                    this.preFilterItems = items;
                    return this.filterList();
                }).finally(() => {
                    if (this.queryPromise === queryPromise) {
                        delete this.queryPromise;
                    }
                });
            
            return (this.queryPromise = queryPromise);
        }
        
        filterList() {
            if (!Array.isArray(this.preFilterItems)) {
                this.items = [];
            }
            this.items = this.preFilterItems.filter(this.createFilter());
            return this.items;
        }
        
        setViewValue(item) {
            if (this.selected === item) {
                // create a shallow copy if this item is already selected
                // causes the model to update
                this.selected = Object.assign(Object.create(this.DataSource.prototype), item);
            } else {
                this.selected = item;
            }
            this.ngModelCtrl.$setViewValue(item);
        }
        
        createNew(event) {
            const dsTypes = this.DataSource.types;
            if (dsTypes.length) {
                this.selected = dsTypes[0].createDataSource();
            } else {
                this.selected = new this.DataSource();
            }
            this.setViewValue(this.selected);
        }
        
        createFilter() {
            if (!this.filter) return (item) => true;

            let filter = this.filter.toLowerCase();
            if (!filter.startsWith('*')) {
                filter = '*' + filter;
            }
            if (!filter.endsWith('*')) {
                filter = filter + '*';
            }
            filter = filter.replace(/\*/g, '.*');
            const regex = new RegExp(filter, 'i');
            
            return (item) => {
                return regex.test(item.name) || regex.test(item.description) || regex.test(item.connectionDescription);
            };
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
            showNew: '<?',
            filter: '<?',
            showEnableSwitch: '<?'
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