/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

var queryPredicate = function queryPredicate() {
    this.operations = [
        { label: '==', value: 'eq' },
        { label: '~=', value: 'like' },
        { label: '>',  value: 'gt' },
        { label: '>=', value: 'ge' },
        { label: '<',  value: 'lt' },
        { label: '<=', value: 'le' },
        { label: '!=', value: 'ne' },
        { label: 'in', value: 'in' }
    ];

    this.$onInit = function() {
    };
    
    this.deleteSelf = function deleteSelf($event) {
        this.onDelete({node: this.node});
    };
};

queryPredicate.$inject = [];

return {
    controller: queryPredicate,
    templateUrl: require.toUrl('./queryPredicate.html'),
    require: {
        'builderCtrl': '^^maQueryBuilder'
    },
    bindings: {
        node: '<',
        properties: '<',
        onDelete: '&'
    },
    designerInfo: {
        hideFromMenu: true
    }
};

}); // define
