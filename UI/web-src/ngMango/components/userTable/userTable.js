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
    {name: 'email', label: 'users.email'},
    {name: 'phone', label: 'users.phone'},
    {name: 'organization', label: 'users.organization', selectedByDefault: true}
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
