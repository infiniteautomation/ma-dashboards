/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

rqlBuilderFactory.$inject = [];
function rqlBuilderFactory() {
    
    const andOr = ['and', 'or'];
    const sortLimit = ['sort', 'limit'];
    const operators = ['match', 'in', 'out', 'select', 'contains', 'excludes', 'values', 'distinct', 'recurse',
        'aggregate', 'between', 'sum', 'mean', 'max', 'min', 'count', 'first', 'one', 'eq', 'ne', 'le', 'ge', 'lt', 'gt',
        'mean', 'sum', 'min', 'max', 'count', 'first', 'one'];

    const reservedValues = ['true', 'false', 'null', 'Infinity', '-Infinity'];

    class RqlNode {
        constructor(name = 'and', args = []) {
            this.name = name;
            this.args = args;
        }

        copy() {
            const copiedArgs = this.args.map(arg => {
                if (arg instanceof this.constructor) {
                    return arg.copy();
                } else {
                    return this.constructor.copyArg(arg);
                }
            });
            return new this.constructor(this.name, copiedArgs);
        }

        static copyArg(arg) {
            if (Array.isArray(arg)) {
                return arg.map(a => this.copyArg(a));
            } else if (arg instanceof Date) {
                return new Date(arg.valueOf());
            } else if (arg != null && typeof arg === 'object') {
                throw new Error('Argument cannot be an object, must be primitive, array or date');
            } else {
                return arg;
            }
        }

        /**
         * Prunes and/or nodes with only one argument
         * Returns null if it is an empty and/or node
         *
         * @returns {RqlNode} the pruned node
         */
        prune() {
            for (let i = 0; i < this.args.length;) {
                let increment = 1;
                const arg = this.args[i];

                if (arg instanceof this.constructor) {
                    const child = arg.prune();
                    if (child) {
                        if (andOr.includes(child.name) && child.name === this.name) {
                            // change and(and(a,b),c) into and(a,b,c) etc
                            this.args.splice(i, 1, ...child.args);
                            increment = child.args.length;
                        } else {
                            this.args[i] = child;
                        }
                    } else {
                        // remove empty and/or nodes
                        this.args.splice(i, 1);
                        increment = 0;
                    }
                }

                i += increment;
            }

            if (andOr.includes(this.name) && this.args.length < 2) {
                return this.args.length > 0 ? this.args[0] : null;
            }

            return this;
        }

        /**
         * Turn the node into a RQL encoded string, 'and' nodes are joined using a ampersand symbol
         * @returns {string}
         */
        toString() {
            return this.name === 'and' ?
                this.encodeArguments('&') :
                this.encode();
        }

        /**
         * Encodes the node into a string including the operator name
         * @returns {string}
         */
        encode() {
            return this.name + '(' + this.encodeArguments() + ')';
        }

        /**
         * Encodes all the arguments into a string
         * @param {string} delimiter
         * @returns {string}
         */
        encodeArguments(delimiter = ',') {
            return this.args
                .map(a => a instanceof this.constructor ? a.encode() : this.constructor.encodeValue(a))
                .join(delimiter);
        }

        /**
         * Checks if a string looks like a date (to Java)
         * @param {string} val
         * @returns {boolean}
         */
        static isDateLike(val) {
            return /^\d{4}-\d{2}-\d{2}/.test(val);
        }

        /**
         * Checks if a string looks like a number (to Java)
         * @param {string} val
         * @returns {boolean}
         */
        static isNumberLike(val) {
            // convert 1_000L to 1000
            const canonical = val.replace(/(\d)_(?=\d)/g, '$1') // Java numbers can have underscore separators
                .replace(/[LFD]$/i, ''); // long, float and double suffixes in Java

            // use Number constructor as it is stricter than Number.parseFloat() etc
            return !Number.isNaN(Number(canonical));
        }

        /**
         * Encodes argument values as strings
         * @param val
         * @returns {string}
         */
        static encodeValue(val) {
            if (val === undefined) {
                throw new Error('Value cannot be undefined');
            } else if (Array.isArray(val)) {
                return '(' + val.map(v => this.encodeValue(v)) + ')';
            } else if (val instanceof Date) {
                return this.encodeString(val.toISOString());
            } else if (typeof val === 'string') {
                // prefix the value if it could potentially be construed as being a primitive reserved value,
                // number, or date
                if (reservedValues.includes(val) || this.isDateLike(val) || this.isNumberLike(val)) {
                    return 'string:' + this.encodeString(val);
                } else {
                    return this.encodeString(val);
                }
            } else {
                return this.encodeString(String(val));
            }
        }

        /**
         * Percent encodes strings including parenthesis
         * @param {string} s
         * @returns {string}
         */
        static encodeString(s) {
            return encodeURIComponent(s)
                .replace(/[\(\)]/g, match => '%' + match.charCodeAt(0).toString(16));
        }
    }

    class RqlBuilder {
        constructor(root = new RqlNode()) {
            this.path = [root];
        }

        build() {
            return this.root.copy().prune();
        }

        toString() {
            return String(this.build() || '');
        }
        
        get current() {
            return this.path[this.path.length - 1];
        }
        
        get root() {
            return this.path[0];
        }

        andOr(name, ...args) {
            const newCurrent = new RqlNode(name, args);
            this.current.args.push(newCurrent);
            this.path.push(newCurrent);
            return this;
        }
        
        not(...args) {
            return this.andOr('not', ...args);
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
            this.current.args.push(new RqlNode(name, args));
            return this;
        }
        
        sortLimit(name, ...args) {
            if (this.path.length > 1) {
                console.warn(`Doing ${name} higher than root`);
            }
            
            if (this.current.name !== 'and') {
                const prev = this.path.pop();
                const replacement = new RqlNode('and', [prev]);
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

export default rqlBuilderFactory;
