/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import requirejs from 'requirejs/require';


var queryPredicate = function queryPredicate() {
    this.operations = [
        { labelTr: 'ui.components.queryPredicate.eq', label: '==', value: 'eq' },
        { labelTr: 'ui.components.queryPredicate.like', label: '~=', value: 'like' },
        { labelTr: 'ui.components.queryPredicate.gt', label: '>',  value: 'gt' },
        { labelTr: 'ui.components.queryPredicate.gte', label: '>=', value: 'ge' },
        { labelTr: 'ui.components.queryPredicate.lt', label: '<',  value: 'lt' },
        { labelTr: 'ui.components.queryPredicate.lte', label: '<=', value: 'le' },
        { labelTr: 'ui.components.queryPredicate.ne', label: '!=', value: 'ne' },
        { labelTr: 'ui.components.queryPredicate.in', label: 'in', value: 'in' }
    ];

    this.$onInit = function() {
    };
    
    this.$onChanges = function(changes) {
        if (changes.node && this.node && typeof this.node.args[0] === 'string') {
            this.propertyName = this.node.args[0];
            
            const matches = /^tags\.(.*)$/.exec(this.propertyName);
            if (matches) {
                this.propertyName = 'tags.';
                this.tagKey = matches[1];
            }
        }
    };
    
    this.deleteSelf = function deleteSelf($event) {
        this.onDelete({node: this.node});
    };
    
    this.tagKeyChanged = function tagKeyChanged() {
        if (this.propertyName === 'tags.') {
            this.node.args[0] = 'tags.' + this.tagKey;
            this.builderCtrl.updateModel();
        }
    };
    
    this.propertyChanged = function propertyChanged() {
        if (this.propertyName === 'tags.') {
            this.node.args[0] = 'tags.' + this.tagKey;
        } else {
            this.node.args[0] = this.propertyName;
        }
        this.builderCtrl.updateModel();
    };
};

queryPredicate.$inject = [];

export default {
    controller: queryPredicate,
    templateUrl: requirejs.toUrl('./queryPredicate.html'),
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


