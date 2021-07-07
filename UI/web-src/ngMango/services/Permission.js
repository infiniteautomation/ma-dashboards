/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

PermissionFactory.$inject = [];
function PermissionFactory() {

    class Minterm {
        constructor(roles) {
            if (Array.isArray(roles)) {
                this.roles = roles.slice().sort();
            } else if (typeof roles === 'string') {
                this.roles = [roles];
            } else {
                throw new Error('Invalid roles');
            }
            this.updateId();
        }

        updateId() {
            this.id = this.roles.join('&');
            this.label = this.toString();
        }

        equals(other) {
            return other.roles.length === this.roles.length && other.roles.every(r => this.has(r));
        }

        toArray() {
            return this.roles.slice();
        }

        toJSON(key) {
            return this.toArray();
        }

        toString() {
            return this.roles.join(' & ');
        }

        has(role) {
            return this.roles.includes(role);
        }

        add(role) {
            if (!this.has(role)) {
                this.roles.push(role);
                this.roles.sort();
                this.updateId();
            }
        }

        delete(role) {
            const i = this.roles.indexOf(role);
            if (i >= 0) {
                this.roles.splice(i, 1);
                this.updateId();
            }
        }

        get size() {
            return this.roles.length;
        }
    }

    class Permission {
        static get Minterm() {
            return Minterm;
        }

        constructor(minterms) {
            if (Array.isArray(minterms)) {
                this.minterms = minterms.map(t => new Minterm(t)).sort();
            } else {
                throw new Error('Invalid minterms');
            }
            this.updateId();
        }

        updateId() {
            this.id = this.minterms.map(t => t.id).join(',');
            this.label = this.toString();
        }

        equals(other) {
            return other.minterms.length === this.minterms.length && other.minterms.every(t => this.has(t));
        }

        toArray() {
            return this.minterms
                .map(t => t.toArray())
                .filter(t => t.length) // just in case
                .map(t => t.length === 1 ? t[0] : t); // reduce to simplified form if only one role in the minterm
        }

        toJSON(key) {
            return this.toArray();
        }

        toString() {
            return this.minterms.map(t => t.toString()).join(', ');
        }

        has(minterm) {
            return this.minterms.some(t => t.equals(minterm));
        }

        add(minterm) {
            if (!this.has(minterm)) {
                this.minterms.push(minterm);
                this.minterms.sort();
                this.updateId();
            }
        }

        delete(minterm) {
            const i = this.minterms.findIndex(t => t.equals(minterm));
            if (i >= 0) {
                this.minterms.splice(i, 1);
                this.updateId();
            }
        }

        get size() {
            return this.minterms.length;
        }
    }

    return Permission;
}

export default PermissionFactory;
