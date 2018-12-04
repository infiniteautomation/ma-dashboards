/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import userListTemplate from './userList.html';

const UPDATE_TYPES = ['add', 'update', 'delete'];

class UserListController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maUser', 'maUserEventManager', '$scope']; }

    constructor(User, UserEventManager, $scope) {
        this.User = User;
        this.UserEventManager = UserEventManager;
        this.$scope = $scope;
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.selectedUser = this.ngModelCtrl.$viewValue;
        
        this.query();
        this.UserEventManager.smartSubscribe(this.$scope, null, UPDATE_TYPES, this.updateHandler.bind(this));
    }
    
    $onChanges(changes) {
        if (changes.filter && !changes.filter.isFirstChange()) {
            this.query();
        }
    }
    
    query() {
        this.users = [];
        
        const queryBuilder = this.User.buildQuery();
        if (this.filter) {
            let filter = this.filter.toLowerCase();
            if (!filter.startsWith('*')) {
                filter = '*' + filter;
            }
            if (!filter.endsWith('*')) {
                filter = filter + '*';
            }
            
            queryBuilder.or()
                .like('username', filter)
                .like('name', filter)
                .up();
        }

        this.usersPromise = queryBuilder
            .limit(1000)
            .query()
            .then(users => this.users = users);
    }
    
    selectUser(user) {
        this.selectedUser = user;
        this.ngModelCtrl.$setViewValue(user);
    }
    
    updateHandler(event, update) {
        this.usersPromise.then(users => {
            const userIndex = users.findIndex(u => u.id === update.object.id);
    
            if (update.action === 'add' || update.action === 'update') {
                const user = userIndex >= 0 && users[userIndex];
                if (user) {
                    angular.merge(user, update.object);
                } else if (this.filterMatches(update.object)) {
                    users.push(angular.merge(new this.User(), update.object));
                }
            } else if (update.action === 'delete' && userIndex >= 0) {
                users.splice(userIndex, 1);
            }
        });
    }
    
    filterMatches(user) {
        if (!this.filter) return true;

        let filter = this.filter.toLowerCase();
        if (!filter.startsWith('*')) {
            filter = '*' + filter;
        }
        if (!filter.endsWith('*')) {
            filter = filter + '*';
        }
        filter = filter.replace(/\*/g, '.*');
        const regex = new RegExp(filter, 'i');

        return regex.test(user.username) || regex.test(user.name);
    }
}

export default {
    controller: UserListController,
    template: userListTemplate,
    require: {
        'ngModelCtrl': 'ngModel'
    },
    bindings: {
        filter: '<?',
        showNewButton: '<?',
        newButtonClicked: '&'
    },
    designerInfo: {
        translation: 'ui.components.maUserList',
        icon: 'people'
    }
};


