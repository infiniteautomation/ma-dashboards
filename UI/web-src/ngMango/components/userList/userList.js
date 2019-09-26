/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import userListTemplate from './userList.html';

class UserListController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maUser', '$scope']; }

    constructor(User, $scope) {
        this.User = User;
        this.$scope = $scope;
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.selectedUser = this.ngModelCtrl.$viewValue;
        
        this.query();
        
        this.User.notificationManager.subscribe((event, item, attributes) => {
            attributes.updateArray(this.users);
        }, this.$scope);
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
        
        return this.usersPromise;
    }
    
    selectUser(user) {
        this.selectedUser = user;
        this.ngModelCtrl.$setViewValue(user);
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