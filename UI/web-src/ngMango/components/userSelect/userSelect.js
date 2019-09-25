/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import userSelectTemplate from './userSelect.html';

class UserSelectController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maUser', '$scope', '$element', 'maUtil']; }
    
    constructor(User, $scope, $element, maUtil) {
        this.User = User;
        this.$scope = $scope;
        
        this.equalByUsername = maUtil.equalByKey.bind(maUtil, 'username');
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
        
        this.getUsers();

        this.User.notificationManager.subscribe((event, item, attributes) => {
            attributes.updateArray(this.users);
        }, this.$scope);
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
