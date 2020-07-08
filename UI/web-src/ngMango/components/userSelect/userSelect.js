/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import userSelectTemplate from './userSelect.html';

class UserSelectController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maUser', '$scope', '$element']; }
    
    constructor(User, $scope, $element) {
        this.User = User;
        this.$scope = $scope;
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();

        this.User.notificationManager.subscribe((event, item, attributes) => {
            attributes.updateArray(this.users, user => {
                return this.matchesFilter(user.username) && (this.hideName || this.matchesFilter(user.name));
            });
        }, this.$scope);
    }
    
    render() {
        this.selected = this.ngModelCtrl.$viewValue;
    }
    
    selectChanged() {
        this.ngModelCtrl.$setViewValue(this.selected);
    }
    
    getUsers(filter, filterChanged) {
        // store for use in websocket subscribe method
        this.filter = filter;

        // dont need to re-query every time drop down opens as we are getting websocket updates
        if (!filterChanged && this.queryPromise) {
            return this.queryPromise;
        }

        const builder = this.User.buildQuery();

        if (filter) {
            const wildcardFilter = `*${filter}*`;
            if (!this.hideName) {
                builder.or()
                    .match('name', wildcardFilter)
                    .match('username', wildcardFilter)
                    .up();
            } else {
                builder.match('username', wildcardFilter)
            }
        }

        this.queryPromise = builder.limit(100).query().then(users => {
            // store for use in websocket subscribe method
            this.users = users;
            return users;
        });

        return this.queryPromise;
    }

    matchesFilter(searchString) {
        return !this.filter || searchString.toLowerCase().includes(this.filter.toLowerCase());
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
