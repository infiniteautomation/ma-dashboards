/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import queryGroupTemplate from './queryGroup.html';
import query from 'rql/query';

const queryGroup = function queryGroup() {
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
        const node = new query.Query();
        node.name = name;
        return node;
    }
    
    function newPredicate() {
        const node = new query.Query();
        node.name = 'eq';
        return node;
    }
};

queryGroup.$inject = [];

export default {
    controller: queryGroup,
    template: queryGroupTemplate,
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


