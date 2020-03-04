/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
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

    static get $inject() { return ['maLogFile', '$scope', '$element', '$injector', 'maUtil']; }

    constructor(maLogFile, $scope, $element, $injector, maUtil) {
        super({
            $scope,
            $element,
            $injector,
            
            resourceService: maLogFile,
            localStorageKey: 'logFileTable',
            defaultColumns,
            defaultSort: [{columnName: 'lastModified', descending: true}],
            disableSortById: true
        });
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
