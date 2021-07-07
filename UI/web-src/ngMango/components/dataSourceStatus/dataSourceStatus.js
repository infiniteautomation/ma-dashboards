/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import dataSourceStatusTemplate from './dataSourceStatus.html';
import './dataSourceStatus.css';

/**
 * @ngdoc directive
 * @name ngMango.directive:maDataSourceStatus
 * @restrict E
 * @description Displays a data source's status: recent poll times and poll aborts
 */

class DataSourceStatusController {
    static get $$ngIsClass() {
        return true;
    }

    static get $inject() {
        return ['$scope', 'maDataSource', 'MA_LIFECYCLE_STATES'];
    }

    constructor($scope, maDataSource, MA_LIFECYCLE_STATES) {
        this.$scope = $scope;
        this.maDataSource = maDataSource;
        this.MA_LIFECYCLE_STATES = MA_LIFECYCLE_STATES;
        this.order = '-startTime';
    }

    $onInit() {
        this.maDataSource.notificationManager.subscribe((event, item, attributes) => {
            if (event.name === 'stateChange') {
                this.state = item.lifecycleState;
            }
        }, this.$scope);
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

        this.promise = this.dataSource.getStatus().then((status) => {
            this.status = status;
            this.state = status.state;
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
