/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Pier Puccini
 */

import TableController from '../../classes/TableController';
import pointTagCountsTableTemplate from './pointTagCountsTable.html';
import './pointTagCountsTable.css';

const DEFAULT_COLUMNS = [
    { name: 'xid', label: 'ui.app.xidShort' },
    // { name: 'dataType', label: 'dsEdit.pointDataType', type: 'enum' },
    // { name: 'tags.zone', label: 'ui.app.tag', labelArgs: 'zone', selectedByDefault: true },
    { name: 'deviceName', label: 'common.deviceName', selectedByDefault: true },
    { name: 'name', label: 'common.name', selectedByDefault: true },
    { name: 'message', label: 'ui.app.msg', filterable: false, selectedByDefault: true },
    // { name: '', filterable: false, sortable: false, selectedByDefault: true },
    { name: 'level', label: 'ui.app.alarmLvl', filterable: false, selectedByDefault: true },
    { name: 'value', label: 'ui.app.pointValue', filterable: false, sortable: false, selectedByDefault: true },
    { name: 'count', label: 'ui.app.alarmCounts', type: 'number', filterable: false, selectedByDefault: true }
];

class PointTagCountsTableController extends TableController {
    static get $inject() {
        return ['maPointTagCounts', 'maDataPointTags', '$scope', '$element', '$injector'];
    }

    constructor(maPointTagCounts, maDataPointTags, $scope, $element, $injector) {
        super({
            $scope,
            $element,
            $injector,

            resourceService: maPointTagCounts,
            localStorageKey: 'pointTagCountsTable',
            defaultColumns: DEFAULT_COLUMNS,
            disableSortById: true
            // defaultSort: [{ columnName: 'deviceName' }, { columnName: 'name' }]
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
    template: pointTagCountsTableTemplate,
    controller: PointTagCountsTableController,
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
        // selectMultiple: '<?',
        // showClear: '<?',
        // rowClicked: '&?',
        // settable: '<?',
        // dataTypes: '<?types',
        userCustomize: '&?customizeQuery'
    }
};
