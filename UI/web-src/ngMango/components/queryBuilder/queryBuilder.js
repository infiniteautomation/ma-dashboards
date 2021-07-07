/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import angular from 'angular';
import queryBuilderTemplate from './queryBuilder.html';
import query from 'rql/query';

const queryProperties = [
    {
        labelTr: 'common.name',
        value: 'name'
    },
    {
        labelTr: 'common.deviceName',
        value: 'deviceName'
    },
    {
        labelTr: 'common.xid',
        value: 'xid'
    },
    {
        labelTr: 'ui.app.dataSourceName',
        value: 'dataSourceName'
    },
    {
        labelTr: 'ui.app.dataSourceXid',
        value: 'dataSourceXid'
    },
    {
        labelTr: 'common.enabled',
        value: 'enabled'
    },
    {
        labelTr: 'pointEdit.props.permission.read',
        value: 'readPermission'
    },
    {
        labelTr: 'pointEdit.props.permission.set',
        value: 'setPermission'
    },
    {
        labelTr: 'ui.components.queryProperty.tag',
        value: 'tags.'
    }
];

QueryBuilderController.$inject = [];
function QueryBuilderController() {
    this.properties = queryProperties;
    this.rootQueryNode = new query.Query();
    this.sort = [{desc: false}];
    this.limit = [];
    
    this.$onInit = function() {
        this.ngModelCtrl.$parsers.unshift(this.parser);
        this.ngModelCtrl.$formatters.push(this.formatter);
        this.ngModelCtrl.$render = this.render;
    };
    
    this.parser = function parser(value) {
        // turn object into RQL
        return value.toString();
    }.bind(this);
    
    this.formatter = function formatter(value) {
        // parse RQL and turn into object
        return new query.Query(value);
    }.bind(this);
    
    this.render = function render() {
        const node = angular.copy(this.ngModelCtrl.$viewValue);
        const sort = [];
        let limit = [];
        for (let i = 0; i < node.args.length; i++) {
            const childNode = node.args[i];
            if (childNode.name === 'sort') {
                for (let j = 0; j < childNode.args.length; j++) {
                    let sortProp = childNode.args[j];
                    let desc = false;
                    if (sortProp.indexOf('-') === 0) {
                        desc = true;
                        sortProp = sortProp.substring(1);
                    } else if (sortProp.indexOf('+') === 0) {
                        sortProp = sortProp.substring(1);
                    }
                    sort.push({prop: sortProp, desc: desc});
                }
                node.args.splice(i--, 1);
            } else if (childNode.name === 'limit') {
                limit = childNode.args;
                node.args.splice(i--, 1);
            }
        }
        sort.push({desc: false});
        this.sort = sort;
        this.limit = limit;

        if (node.args.length === 1 && node.args[0] instanceof query.Query && node.args[0].name === 'or') {
            this.rootQueryNode = node.args[0];
        } else {
            this.rootQueryNode = node;
        }
    }.bind(this);
    
    this.updateModel = function() {
        let node = angular.copy(this.rootQueryNode);
        let sortNode, limitNode;

        this.sort = this.sort.filter(s => !!s.prop);
        if (this.sort.length) {
            const sortArgs = this.sort.map(s => {
                return (s.desc ? '-' : '') + s.prop;
            });
            sortNode = new query.Query({name: 'sort', args: sortArgs});
        }
        this.sort.push({desc: false});

        if (this.limit.length) {
            if (this.limit.length > 1 && this.limit[1] === null) {
                this.limit.pop();
            }
            if (this.limit.length > 1 && this.limit[0] === null) {
                this.limit[0] = 100;
            }
            if (this.limit[0] !== null) {
                limitNode = new query.Query({name: 'limit', args: this.limit});
            }
        }
        
        if (node.name === 'or' && !node.args.length) {
            node = new query.Query({name: 'and', args: []});
        }
        
        if (sortNode || limitNode) {
            if (node.name === 'or') {
                node = new query.Query({name: 'and', args: [node]});
            }
            
            if (sortNode)
                node.push(sortNode);
            if (limitNode)
                node.push(limitNode);
        }

        this.ngModelCtrl.$setViewValue(node);
    };
}

export default {
    controller: QueryBuilderController,
    template: queryBuilderTemplate,
    require: {
        'ngModelCtrl': 'ngModel'
    },
    bindings: {
        hideSortLimit: '<?'
    },
    designerInfo: {
        hideFromMenu: true
    }
};
