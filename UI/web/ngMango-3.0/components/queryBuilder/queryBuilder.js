/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require', 'rql/query'], function(angular, require, query) {
'use strict';

var queryBuilder = function queryBuilder(cssInjector) {
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
        var node = angular.copy(this.ngModelCtrl.$viewValue);
        var sort = [];
        var limit = [];
        for (var i = 0; i < node.args.length; i++) {
            var childNode = node.args[i];
            if (childNode.name === 'sort') {
                for (var j = 0; j < childNode.args.length; j++) {
                    var sortProp = childNode.args[j];
                    var desc = false;
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
        var node = angular.copy(this.rootQueryNode);
        var sortNode, limitNode;
        
        if (this.sort[this.sort.length-1].prop) {
            this.sort.push({desc: false});
        }
        for (var i = 0; i < this.sort.length - 1; i++) {
            if (!this.sort[i].prop)
                this.sort.splice(i--, 1);
        }
        if (this.sort.length > 1) {
            var sortArgs = [];
            for (i = 0; i < this.sort.length - 1; i++) {
                var sortProp = this.sort[i];
                sortArgs.push((sortProp.desc ? '-' : '') + sortProp.prop);
            }
            sortNode = new query.Query({name: 'sort', args: sortArgs});
        }
        
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
};

queryBuilder.$inject = ['cssInjector'];

return {
    controller: queryBuilder,
    templateUrl: require.toUrl('./queryBuilder.html'),
    require: {
        'ngModelCtrl': 'ngModel'
    },
    bindings: {
        properties: '<',
        hideSortLimit: '<?'
    }
};

}); // define
