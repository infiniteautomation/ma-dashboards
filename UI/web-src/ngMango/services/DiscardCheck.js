/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

discardCheckFactory.$inject = ['$rootScope', '$window', 'maTranslate'];
function discardCheckFactory($rootScope, $window, maTranslate) {

    class DiscardCheck {
        constructor(options) {
            Object.assign(this, options);
            
            this.$scope.$on('$stateChangeStart', (...args) => {
                this.stateChangeStart(...args);
            });
    
            const beforeunload = (...args) => {
                this.beforeunload(...args);
            };
            
            $window.addEventListener('beforeunload', beforeunload);
            this.$scope.$on('$destroy', e => {
                $window.removeEventListener('beforeunload', beforeunload);
            });
        }
        
        stateChangeStart(event) {
            if (event.defaultPrevented) return;
            
            const dirty = this.isDirty();
            if (!dirty || this.confirmDiscard()) {
                if (dirty && typeof this.onDiscard === 'function') {
                    this.onDiscard();
                }
            } else {
                event.preventDefault();
            }
        }
        
        beforeunload(event) {
            if (this.isDirty()) {
                const text = this.confirmDiscardMessage();
                event.returnValue = text;
                return text;
            }
        }
        
        canDiscard() {
            return !this.isDirty() || this.confirmDiscard();
        }
        
        confirmDiscard() {
            return $window.confirm(this.confirmDiscardMessage());
        }
        
        confirmDiscardMessage() {
            return maTranslate.trSync('ui.app.discardUnsavedChanges');
        }
    }
    
    return DiscardCheck;
}

export default discardCheckFactory;
