/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import moment from 'moment-timezone';
import purgePointValuesTemplate from './purgePointValues.html';
import './purgePointValues.css';

/**
 * @ngdoc directive
 * @name ngMango.directive:maPurgePointValues
 * @restrict E
 * @description Used to purge point values for a set of data points or a data source
 */

class PurgePointValuesController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maDialogHelper', 'maPointValues', '$scope', '$timeout']; }
    
    constructor(DialogHelper, pointValues, $scope, $timeout) {
        this.DialogHelper = DialogHelper;
        this.pointValues = pointValues;
        this.$scope = $scope;
        this.$timeout = $timeout;
        
        this.duration = {
            periods: 1,
            type: 'YEARS'
        };
        
        this.useTimeRange = false;
        this.to = moment().startOf('month').toDate();
        this.from = moment(this.to).subtract(1, 'month').toDate();
    }
    
    $onInit() {
    }
    
    $onChanges(changes) {
        if (changes.cancelAttr && !changes.cancelAttr.isFirstChange()) {
            this.cancel();
        }
    }
    
    confirmStart(event) {
        if (Array.isArray(this.dataPoints) && this.dataPoints.length) {
            this.DialogHelper.confirm(event, ['ui.app.bulkEditConfirmPurge', this.dataPoints.length]).then(() => {
                this.start();
            }, () => null);
        } else if (this.dataSource) {
            this.DialogHelper.confirm(event, ['ui.app.bulkEditConfirmPurgeDataSource', this.dataPoints.length]).then(() => {
                this.start();
            }, () => null);
        }
    }
    
    start() {
        if (this.timeoutPromise) {
            this.$timeout.cancel(this.timeoutPromise);
            delete this.timeoutPromise;
        }
        
        this.purgeTask = new this.pointValues.PurgeTemporaryResource({
            xids: Array.isArray(this.dataPoints) && this.dataPoints.map(p => p.xid),
            dataSourceXid: this.dataSource && this.dataSource.xid,
            purgeAll: this.purgeAll,
            duration: this.duration,
            useTimeRange: this.useTimeRange,
            timeRange: {
                from: this.from,
                to: this.to
            }
        });
        
        this.purgePromise = this.purgeTask.start(this.$scope);

        this.purgePromise.then(purgeTask => {
            this.purgeTask = purgeTask;
        }, null, update => {
            this.purgeTask = update;
        }).finally(() => {
            delete this.purgePromise;
            
            this.timeoutPromise = this.$timeout(() => {
                delete this.purgeTask;
                delete this.timeoutPromise;
            }, 10000);
        });
    }
    
    cancel() {
        if (this.purgeTask) {
            this.purgeTask.cancel();
        }
    }
}

export default {
    template: purgePointValuesTemplate,
    controller: PurgePointValuesController,
    bindings: {
        dataPoints: '<?points',
        dataSource: '<?source',
        onPurge: '&?',
        cancelAttr: '<?cancel'
    }
};
