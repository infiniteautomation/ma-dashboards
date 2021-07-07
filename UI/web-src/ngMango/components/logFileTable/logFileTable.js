/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import logFileTableTemplate from './logFileTable.html';
import './logFileTable.css';
import TableController from '../../classes/TableController';

const defaultColumns = [
    //{name: 'folderPath'},
    {name: 'filename', label: 'ui.app.filename', selectedByDefault: true},
    //{name: 'mimeType', label: 'ui.app.fileType'},
    {name: 'lastModified', label: 'ui.app.lastModified', type: 'date', selectedByDefault: true},
    {name: 'size', label: 'ui.app.fileSize', type: 'integer', selectedByDefault: true, formatValue(value) {
        return this.tableCtrl.maUtil.formatBytes(value);
    }}
];

class LogFileTableController extends TableController {

    static get $inject() { return ['maLogFile', '$scope', '$element', '$injector']; }

    constructor(maLogFile, $scope, $element, $injector) {
        super({
            $scope,
            $element,
            $injector,
            $state: $injector.has('$state') && $injector.get('$state'),
            
            resourceService: maLogFile,
            localStorageKey: 'logFileTable',
            defaultColumns,
            defaultSort: [{columnName: 'lastModified', descending: true}],
            disableSortById: true
        });
    }
    
    getFilters() {
        const filters = super.getFilters();
        if (this.$state && this.$state.params.filenameFilter) {
            this.showFilters = true;
            const filenameFilter = this.$state.params.filenameFilter;
            filters.filename = filenameFilter;
        }
        return filters;
    }
    
    filterChanged() {
        super.filterChanged();

        if (this.$state) {
            this.$state.params.filenameFilter = this.settings.filters.filename || null;
            this.$state.go('.', this.$state.params, {location: 'replace', notify: false});
        }
    }
}

export default {
    template: logFileTableTemplate,
    controller: LogFileTableController,
    require: {
        ngModelCtrl: '?ngModel'
    },
    bindings: {
        localStorageKey: '<?',
        selectMultiple: '<?',
        showClear: '<?',
        dateFormat: '@?',
        showActions: '<?',
        rowClicked: '&?'
    }
};
