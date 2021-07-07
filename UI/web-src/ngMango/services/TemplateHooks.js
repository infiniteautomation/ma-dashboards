/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

class TemplateHooksProvider {
    static get $$ngIsClass() { return true; }
    static get $inject() { return []; }

    constructor() {
        const hooks = this.hooks = {};

        this.$get = class TemplateHooks {
            static get $$ngIsClass() { return true; }
            static get $inject() { return []; }

            constructor() {
            }

            /**
             * @param {string} name hook name
             * @returns {boolean}
             */
            hasHook(name) {
                return hooks.hasOwnProperty(name);
            }

            /**
             * @param {string} name hook name
             * @returns {string} template
             */
            getTemplate(name) {
                return hooks[name];
            }
        };
    }

    /**
     * @param {string} name hook name
     * @param {string} template AngularJS template
     */
    addHook(name, template) {
        this.hooks[name] = template;
    }
}

export default TemplateHooksProvider;
