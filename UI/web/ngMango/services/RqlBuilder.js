/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'rql/query'], function(angular, rqlQueryLib) {
'use strict';

const Query = rqlQueryLib.Query;

rqlBuilderFactory.$inject = [];
function rqlBuilderFactory() {
    
    const andOr = ['and', 'or'];
    const sortLimit = ['sort', 'limit'];
    const operators = ['match', 'in', 'out', 'select', 'contains', 'excludes', 'values', 'distinct', 'recurse',
        'aggregate', 'between', 'sum', 'mean', 'max', 'min', 'count', 'first', 'one', 'eq', 'ne', 'le', 'ge', 'lt', 'gt',
        'mean', 'sum', 'min', 'max', 'count', 'first', 'one'];

    const prune = function prune(current) {
        for (let i = 0; i < current.args.length;) {
            let increment = 1;
            const arg = current.args[i];
            
            if (arg instanceof Query) {
                const child = prune(arg);
                
                if (child) {
                    if (andOr.indexOf(child.name) >= 0 && child.name === current.name) {
                        current.args.splice(i, 1, ...child.args);
                        increment = child.args.length;
                    } else {
                        current.args[i] = child;
                    }
                } else {
                    current.args.splice(i, 1);
                    increment = 0;
                }
            }
            
            i += increment;
        }
        
        if (andOr.indexOf(current.name) >= 0 && current.args.length < 2) {
            return current.args.length > 0 ? current.args[0] : null;
        }
        
        return current;
    };

    class RqlBuilder {
        constructor(name, ...args) {
            let root;
            if (name instanceof Query) {
                root = name;
            } else {
                root = new Query({
                    name: name || 'and',
                    args: args
                });
            }

            this.path = [root];
        }

        static parse(rqlString) {
            return new this.constructor(new Query(rqlString));
        }
        
        toString() {
            const prunedCopy = prune(angular.copy(this.root));
            if (!prunedCopy) {
                return '';
            }
            return prunedCopy.toString();
        }
        
        get current() {
            return this.path[this.path.length - 1];
        }
        
        get root() {
            return this.path[0];
        }

        andOr(name, ...args) {
            const newCurrent = new Query({
                name: name,
                args: args
            });
            
            this.current.args.push(newCurrent);
            this.path.push(newCurrent);
            return this;
        }

        up() {
            if (this.path.length > 1) {
                this.path.pop();
            } else {
                console.warn('Tried to go below root');
            }
            return this;
        }
        
        op(name, ...args) {
            this.current.args.push(new Query({
                name: name,
                args: args
            }));
            return this;
        }
        
        sortLimit(name, ...args) {
            if (this.path.length > 1) {
                console.warn(`Doing ${name} higher than root`);
            }
            
            if (this.current.name !== 'and') {
                const prev = this.path.pop();
                const replacement = new Query({
                    name: 'and',
                    args: [prev]
                });
                this.path.push(replacement);
            }

            return this.op(name, ...args);
        }

        query(opts) {
            if (this.queryFunction) {
                return this.queryFunction(this, opts);
            }
        }
    }
    
    andOr.forEach(name => {
        RqlBuilder.prototype[name] = function(...args) {
            return this.andOr(name, ...args);
        };
    });
    
    operators.forEach(name => {
        RqlBuilder.prototype[name] = function(...args) {
            return this.op(name, ...args);
        };
    });
    
    sortLimit.forEach(name => {
        RqlBuilder.prototype[name] = function(...args) {
            return this.sortLimit(name, ...args);
        };
    });
    
    return RqlBuilder;
}

return rqlBuilderFactory;

}); // define
