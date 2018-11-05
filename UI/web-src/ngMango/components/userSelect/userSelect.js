/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import userSelectTemplate from './userSelect.html';

const UPDATE_TYPES = ['add', 'update', 'delete'];

class UserSelectController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maUser', 'maUserEventManager', '$scope', '$element', 'maUtil']; }
    
    constructor(User, UserEventManager, $scope, $element, maUtil) {
        this.User = User;
        this.UserEventManager = UserEventManager;
        this.$scope = $scope;
        
        this.equalByUsername = maUtil.equalByKey.bind(maUtil, 'username');
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
        
        this.getUsers();
        this.UserEventManager.smartSubscribe(this.$scope, null, UPDATE_TYPES, this.updateHandler.bind(this));
    }
    
    render() {
        this.selected = this.ngModelCtrl.$viewValue;
    }
    
    selectChanged() {
        // compare the sets of usernames and only set the view value if they are different
        // this is needed as the md-select calls ng-change when its options are initialized and its view value isn't a full model
        // we only want to set the view value when the user actually interacts with the select
        if (!this.equalByUsername(this.selected, this.ngModelCtrl.$viewValue)) {
            this.ngModelCtrl.$setViewValue(this.selected);
        }
    }
    
    getUsers() {
        this.usersPromise = this.User.buildQuery().limit(10000).query().then(users => {
            this.users = users;
            return users;
        });
    }
    
    updateHandler(event, update) {
        this.usersPromise.then(users => {
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
    }
}

export default {
    controller: UserSelectController,
    template: userSelectTemplate,
    require: {
        'ngModelCtrl': 'ngModel'
    },
    bindings: {
        showClear: '<?',
        selectMultiple: '<?',
        hideName: '<?'
    },
    transclude: {
        label: '?maLabel'
    },
    designerInfo: {
        translation: 'ui.components.maUserSelect',
        icon: 'people',
        attributes: {
            showClear: {type: 'boolean'}
        }
    }
};
