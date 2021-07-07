/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import deviceNameScrollListMdTemplate from './deviceNameScrollList-md.html';
import deviceNameScrollListTemplate from './deviceNameScrollList.html';

deviceNameScrollList.$inject = ['$injector'];
export default deviceNameScrollList;

function deviceNameScrollList($injector) {
    return {
        restrict: 'E',
        controllerAs: '$ctrl',
        bindToController: true,
        scope: {
            selectFirst: '<?',
            // attributes that start with data- have the prefix stripped
            dataSourceId: '<?sourceId',
            dataSourceXid: '<?sourceXid',
            contains: '<?',
            start: '<?',
            limit: '<?',
            sort: '<?',
            onQuery: '&?'
        },
        template: function() {
            if ($injector.has('$mdUtil')) {
                return deviceNameScrollListMdTemplate;
            }
            return deviceNameScrollListTemplate;
        },
        require: {
            'ngModelCtrl': 'ngModel'
        },
        controller: ['maDeviceName', '$timeout', DeviceNameScrollListController],
        designerInfo: {
            translation: 'ui.components.deviceNameScrollList',
            icon: 'playlist_play'
        }
    };
    
    function DeviceNameScrollListController(DeviceName, $timeout) {
        this.$onInit = function() {
            this.ngModelCtrl.$render = this.render.bind(this);

            this.doQuery().then(function(items) {
                if ((this.selectFirst === undefined || this.selectFirst) && items.length) {
                    this.setViewValue(items[0]);
                }
            }.bind(this));
        };
        
        this.$onChanges = function(changes) {
            if ((changes.dataSourceId && !changes.dataSourceId.isFirstChange()) ||
                    (changes.dataSourceXid && !changes.dataSourceXid.isFirstChange()) ||
                    (changes.contains && !changes.contains.isFirstChange()) ||
                    (changes.start && !changes.start.isFirstChange()) ||
                    (changes.limit && !changes.limit.isFirstChange()) ||
                    (changes.sort && !changes.sort.isFirstChange())) {
                this.doQuery();
            }
        };
        
        this.doQuery = function() {
            let query;
            if (this.dataSourceId !== undefined) {
                query = DeviceName.byDataSourceId({id: this.dataSourceId, contains: this.contains});
            } else if (this.dataSourceXid) {
                query = DeviceName.byDataSourceXid({xid: this.dataSourceXid, contains: this.contains});
            } else {
                query = DeviceName.query({contains: this.contains});
            }
            
            this.queryPromise = query.$promise.then(function(items) {
                items = items.sort();
                if (this.sort && this.sort.indexOf('-') === 0) {
                    items.reverse();
                }
                if (this.start || this.limit) {
                    const start = this.start || 0;
                    const end = this.limit ? start + this.limit : items.length - start + 1;
                    items = items.slice(start, end);
                }
                return (this.items = items);
            }.bind(this));
            
            if (this.onQuery) {
                this.onQuery({$promise: this.queryPromise});
            }
            
            return this.queryPromise;
        };
        
        this.setViewValue = function(item) {
            this.ngModelCtrl.$setViewValue(item);
            this.render();
        };
        
        this.render = function() {
            this.selected = this.ngModelCtrl.$viewValue;
        };
    }
}


