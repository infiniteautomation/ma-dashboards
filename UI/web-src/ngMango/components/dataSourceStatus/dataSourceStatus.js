/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import dataSourceStatusTemplate from './dataSourceStatus.html';

/**
 * @ngdoc directive
 * @name ngMango.directive:maDataSourceStatus
 * @restrict E
 * @description Displays a data source's status: recent poll times and poll aborts
 */

class DataSourceStatusController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return []; }
    
    constructor() {
        this.order = '-startTime';
    }

    $onChanges(changes) {
        if (changes.dataSource || changes.refresh) {
            this.getStatus();
        }
    }

    getStatus() {
        delete this.promise;
        
        if (!this.dataSource || this.dataSource.isNew()) {
            this.status = {};
            return;
        }

        this.promise = this.dataSource.getStatus().then(status => {
            this.status = status;
        });
    }
}

export default {
    template: dataSourceStatusTemplate,
    controller: DataSourceStatusController,
    bindings: {
        dataSource: '<source',
        refresh: '<?'
    },
    designerInfo: {
        translation: 'ui.components.dataSourceStatus',
        icon: 'device_hub'
    }
};
