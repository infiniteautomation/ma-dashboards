/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import userSelectTemplate from './userSelect.html';

const UPDATE_TYPES = ['add', 'update', 'delete'];

UserSelectController.$inject = ['maUser', 'maUserEventManager', '$scope'];
function UserSelectController(User, UserEventManager, $scope) {
    this.User = User;
    this.UserEventManager = UserEventManager;
    this.$scope = $scope;
}

UserSelectController.prototype.$onInit = function() {
    const $ctrl = this;
    this.ngModelCtrl.$render = function() {
        $ctrl.selectedUser = this.$viewValue;
    };
    this.users = this.User.query({rqlQuery: 'limit(10000)'});
    
    this.UserEventManager.smartSubscribe(this.$scope, null, UPDATE_TYPES, this.updateHandler.bind(this));
};

UserSelectController.prototype.selectUser = function(user) {
    this.ngModelCtrl.$setViewValue(user);
};

UserSelectController.prototype.updateHandler = function(event, update) {
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

export default {
    controller: UserSelectController,
    template: userSelectTemplate,
    require: {
        'ngModelCtrl': 'ngModel'
    },
    bindings: {
        showClear: '<?'
    },
    transclude: {
        label: '?maLabel'
    },
    designerInfo: {
        translation: 'ui.components.maUserSelect',
        icon: 'people',
        attributes: {
            showClear: {type: 'boolean'}
        },
    }
};


