/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import userTableTemplate from './userTable.html';
import './userTable.css';
import TableController from '../../classes/TableController';

const defaultColumns = [
    {name: 'username', label: 'users.username', selectedByDefault: true},
    {name: 'name', label: 'users.name', selectedByDefault: true},
    {name: 'email', label: 'users.email', selectedByDefault: true},
    {name: 'phone', label: 'users.phone'},
    {name: 'organization', label: 'users.organization'},
    {name: 'organizationalRole', label: 'users.organizationalRole'},
    {name: 'permissions', label: 'users.permissions', sortable: false, array: true},
    {name: 'disabled', label: 'common.disabled', boolean: true},
    {name: 'muted', label: 'users.muted', boolean: true},
    {name: 'created', label: 'ui.app.userCreated', date: true, filterable: false},
    {name: 'emailVerified', label: 'ui.app.userEmailVerified', date: true, filterable: false},
    {name: 'lastLogin', label: 'ui.app.lastLoginStatic', date: true, filterable: false},
    {name: 'lastPasswordChange', label: 'ui.app.lastPasswordChangeStatic', date: true, filterable: false},
    {name: 'passwordLocked', label: 'users.passwordLocked', filterable: false, sortable: false},
    {name: 'locale', label: 'users.locale'},
    {name: 'timezone', label: 'users.timezone'},
    {name: 'homeUrl', label: 'users.homeURL'},
    {name: 'receiveAlarmEmails', label: 'users.receiveAlarmEmails', exact: true},
    {name: 'receiveOwnAuditEvents', label: 'users.receiveOwnAuditEvents', boolean: true}
];

class UserTableController extends TableController {
    
    static get $inject() { return ['maUser', '$scope', '$element', '$injector']; }

    constructor(maUser, $scope, $element, $injector) {
        super({
            $scope,
            $element,
            $injector,
            
            resourceService: maUser,
            localStorageKey: 'userTable',
            defaultColumns,
            defaultSort: [{columnName: 'username'}]
        });
    }
}

export default {
    template: userTableTemplate,
    controller: UserTableController,
    require: {
        ngModelCtrl: '?ngModel'
    },
    bindings: {
        localStorageKey: '<?',
        selectMultiple: '<?',
        showClear: '<?'
    }
};
