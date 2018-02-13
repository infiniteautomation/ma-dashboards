/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

var UPDATE_TYPES = ['add', 'update', 'delete'];

UserListController.$inject = ['maUser', 'maUserEventManager', '$scope'];
function UserListController(User, UserEventManager, $scope) {
    this.User = User;
    this.UserEventManager = UserEventManager;
    this.$scope = $scope;
}

UserListController.prototype.$onInit = function() {
    var $ctrl = this;
    this.ngModelCtrl.$render = function() {
        $ctrl.selectedUser = this.$viewValue;
    };
    this.users = this.User.query({rqlQuery: 'limit(10000)'});
    
    this.UserEventManager.smartSubscribe(this.$scope, null, UPDATE_TYPES, this.updateHandler.bind(this));
};

UserListController.prototype.selectUser = function(user) {
    this.ngModelCtrl.$setViewValue(user);
    this.ngModelCtrl.$render();
};

UserListController.prototype.updateHandler = function(event, update) {
    this.users.$promise.then(users => {
        const userIndex = users.findIndex(u => u.id === update.object.id);

        if (update.action === 'add' || update.action === 'update') {
            const user = userIndex >= 0 && users[userIndex];
            if (user) {
                angular.merge(user, update.object);
            } else {
                users.push(angular.merge(new this.User(), update.object));
            }
        } else if (update.action === 'delete' && userIndex >= 0) {
            users.splice(userIndex, 1);
        }
    });
};

return {
    controller: UserListController,
    templateUrl: require.toUrl('./userList.html'),
    require: {
        'ngModelCtrl': 'ngModel'
    },
    bindings: {
        showNewButton: '<?',
        newButtonClicked: '&'
    },
    designerInfo: {
        translation: 'ui.components.maUserList',
        icon: 'people'
    }
};

}); // define
