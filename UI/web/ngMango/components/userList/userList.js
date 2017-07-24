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
    this.users = this.User.query();
    
    this.UserEventManager.smartSubscribe(this.$scope, null, UPDATE_TYPES, this.updateHandler.bind(this));
};

UserListController.prototype.selectUser = function(user) {
    this.ngModelCtrl.$setViewValue(user);
    this.ngModelCtrl.$render();
};

UserListController.prototype.updateHandler = function(event, update) {
    this.users.$promise.then(function(users) {
        var user;
        for (var i = 0; i < users.length; i++) {
            if (users[i].username === update.object.username) {
                user = users[i];
                break;
            }
        }

        if (update.action === 'add' && !user) {
            users.push(angular.merge(new this.User(), update.object));
        } else if (update.action === 'update') {
            angular.merge(user, update.object);
        } else if (update.action === 'delete') {
            users.splice(i, 1);
        }
    }.bind(this));
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
