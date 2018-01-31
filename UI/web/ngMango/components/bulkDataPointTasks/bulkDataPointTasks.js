/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

class BulkDataPointTasksController {
    static get $$ngIsClass() { return true; }
    
    static get $inject() { return ['$scope', 'maPoint', 'maUser']; }
    constructor($scope, maPoint, maUser) {
        this.$scope = $scope;
        this.maPoint = maPoint;
        this.maUser = maUser;
    }
    
    updateHandler(event, item, originalXid) {

        this.reorderTable();
    }
    
    $onInit() {
        this.maPoint.bulk.subscribe((event, item) => {
            const index = this.items.findIndex(i => i.id === item.id);
            if (index >= 0) {
                if (event.name === 'update' || event.name === 'create') {
                    this.items[index] = item;
                } else if (event.name === 'delete') {
                    this.items.splice(index, 1);
                }
            } else if (event.name === 'update' || event.name === 'create') {
                if (this.allUsers || item.userId === this.maUser.current.id) {
                    this.items.push(item);
                }
            }
        }, this.$scope);
        
        const queryBuilder = this.maPoint.bulk.buildQuery();
        if (!this.allUsers) {
            queryBuilder.eq('userId', this.maUser.current.id);
        }
        queryBuilder.query().then(items => {
             this.items = items;
        });
    }
    
    $onChanges(changes) {
    }
}

return {
    templateUrl: require.toUrl('./bulkDataPointTasks.html'),
    controller: BulkDataPointTasksController,
    bindings: {
        allUsers: '<?'
    },
    require: {
    }
};

}); // define
