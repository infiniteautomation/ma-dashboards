/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import userSelectTemplate from './userSelect.html';

class UserSelectController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maUser', '$scope', '$element']; }
    
    constructor(User, $scope, $element) {
        this.User = User;
        this.$scope = $scope;
        this.pageSize = 100;
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();

        this.User.notificationManager.subscribe((event, item, attributes) => {
            const prevLength = this.users.length;
            attributes.updateArray(this.users, user => {
                return this.matchesFilter(user.username) && (this.hideName || this.matchesFilter(user.name));
            });

            this.users.sort((a, b) => {
                if (a.username < b.username) return -1;
                if (b.username > a.username) return 1;
                return 0;
            });

            // truncate the array back to the previous length
            if (this.users.length > prevLength) {
                this.users.length = prevLength;
            }
        }, this.$scope);
    }
    
    render() {
        this.selected = this.ngModelCtrl.$viewValue;
    }
    
    selectChanged() {
        this.ngModelCtrl.$setViewValue(this.selected);
    }
    
    getUsers(filter, filterChanged, loadMore) {
        // store for use in websocket subscribe method
        this.filter = filter;

        // dont need to re-query every time drop down opens as we are getting websocket updates
        if (!filterChanged && !loadMore && this.queryPromise) {
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

        const offset = Array.isArray(this.users) && loadMore ? this.users.length : 0;
        this.queryPromise = builder.sort('username').limit(this.pageSize, offset).query().then(users => {
            if (loadMore) {
                this.users.push(...users);
                this.users.$total = users.$total;
            } else {
                this.users = users;
            }
            return this.users;
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
        hideName: '<?',
        disabled: '<?ngDisabled',
        required: '<?ngRequired'
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
