/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import TableController from '../../classes/TableController';
import dataPointEventCountsTableTemplate from './dataPointEventCountsTable.html';
import './dataPointEventCountsTable.css';

const DEFAULT_COLUMNS = [
    { name: 'xid', label: 'ui.app.xidShort' },
    { name: 'deviceName', label: 'common.deviceName', selectedByDefault: true },
    { name: 'name', label: 'common.name', selectedByDefault: true },
    { name: 'message', label: 'ui.app.msg', filterable: false, sortable: false, selectedByDefault: true },
    { name: 'alarmLevel', label: 'ui.app.alarmLvl', filterable: false, selectedByDefault: true },
    { name: 'latestActive', label: 'ui.app.activeStatus', filterable: false, selectedByDefault: true },
    { name: 'latestActiveDuration', label: 'ui.app.duration', type: 'duration', filterable: false, sortable: false, selectedByDefault: true },
    { name: 'value', label: 'ui.app.pointValue', filterable: false, sortable: false, selectedByDefault: true },
    { name: 'count', label: 'ui.app.alarmCounts', type: 'number', filterable: false, selectedByDefault: true }
];

class DataPointEventCountsTableController extends TableController {
    static get $inject() {
        return ['$scope', '$element', '$injector', 'maPointEventCounts', 'maDataPointTags'];
    }

    constructor($scope, $element, $injector, maPointEventCounts, maDataPointTags) {
        super({
            $scope,
            $element,
            $injector,

            resourceService: maPointEventCounts,
            localStorageKey: 'dataPointEventCountsTable',
            defaultColumns: DEFAULT_COLUMNS,
            disableSortById: true,
            defaultSort: [{ columnName: 'latestActive' }]
        });

        this.maDataPointTags = maDataPointTags;
    }

    $onChanges(changes) {
        if ((changes.localStorageKey && changes.localStorageKey.currentValue) || (changes.defaultSort && changes.defaultSort.currentValue)) {
            this.loadSettings();
        }
        if (changes.refreshTable && changes.refreshTable.currentValue) {
            this.filterChanged();
        }
    }

    loadSettings() {
        super.loadSettings();
    }

    loadColumns() {
        return super
            .loadColumns()
            .then(() => this.maDataPointTags.keys())
            .then((keys) => {
                const filters = this.settings.filters || {};
                this.tagColumns = keys
                    .filter((k) => !['device', 'name'].includes(k))
                    .map((k, i) => {
                        const name = `tags.${k}`;
                        return this.createColumn({
                            tagKey: k,
                            name,
                            label: 'ui.app.tag',
                            labelArgs: [k],
                            filter: filters[name] || null,
                            order: 500 + i,
                            dateFormat: this.dateFormat
                        });
                    });
                this.nonTagColumns = this.columns;
                this.columns = this.columns.concat(this.tagColumns);
            });
    }

    doQuery(queryBuilder, opts) {
        return queryBuilder.query({ to: this.to, from: this.from }, opts);
    }

    customizeQuery(queryBuilder) {
        if (typeof this.userCustomize === 'function') {
            this.userCustomize({ $queryBuilder: queryBuilder });
        }
    }
}

export default {
    template: dataPointEventCountsTableTemplate,
    controller: DataPointEventCountsTableController,
    require: {
        ngModelCtrl: 'ngModel'
    },
    bindings: {
        localStorageKey: '<?',
        defaultColumns: '<?',
        defaultSort: '<?',
        refreshTable: '<?',
        to: '<?',
        from: '<?',
        userCustomize: '&?customizeQuery'
    }
};
