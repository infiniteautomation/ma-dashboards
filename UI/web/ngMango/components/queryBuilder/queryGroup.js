/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import requirejs from 'requirejs/require';
import query from 'rql/query';


var queryGroup = function queryGroup() {
    this.$onInit = function() {
    };
    
    this.addPredicate = function addPredicate() {
        this.node.push(newPredicate());
        this.builderCtrl.updateModel();
    };
    
    this.addGroup = function addGroup($event) {
        this.node.push(newGroup(this.node.name === 'and' ? 'or' : 'and'));
        this.builderCtrl.updateModel();
    };
    
    this.toggleName = function toggleName($event) {
        this.node.name = this.node.name === 'and' ? 'or' : 'and';
        this.builderCtrl.updateModel();
    };
    
    this.setName = function toggleName($event, name) {
        this.node.name = name;
        this.builderCtrl.updateModel();
    };
    
    this.deleteSelf = function deleteSelf($event) {
        this.onDelete({node: this.node});
    };

    this.deleteChild = function deleteChild(index, node) {
        this.node.args.splice(index, 1);
        this.builderCtrl.updateModel();
    };
    
    function newGroup(name) {
        var node = new query.Query();
        node.name = name;
        return node;
    }
    
    function newPredicate() {
        var node = new query.Query();
        node.name = 'eq';
        return node;
    }
};

queryGroup.$inject = [];

export default {
    controller: queryGroup,
    templateUrl: requirejs.toUrl('./queryGroup.html'),
    require: {
        'builderCtrl': '^^maQueryBuilder'
    },
    bindings: {
        node: '<',
        depth: '<',
        properties: '<',
        onDelete: '&'
    },
    designerInfo: {
        hideFromMenu: true
    }
};


