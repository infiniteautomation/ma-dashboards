/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import eventHandlerScriptEditorTemplate from './eventHandlerScriptEditor.html';

class EventHandlerScriptEditorController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$scope', 'maFileStore', 'maEventHandler', 'maScript']; }
    
    constructor($scope, maFileStore, maEventHandler, maScript) {
        this.$scope = $scope;
        this.maFileStore = maFileStore;
        this.maEventHandler = maEventHandler;
        this.maScript = maScript;
    }
    
    $onInit() {
        this.$scope.editor = this.editor;
        
        this.maScript.scriptEngines().then(engines => {
            this.engines = engines;
            if (!this.eventHandler.engineName && engines.length) {
                this.eventHandler.engineName = engines[0].engineName;
            }
            this.updateEditMode();
        });
    }
    
    $onChanges(changes) {
        if (changes.eventHandler) {
            this.updateEditMode();
        }
    }
    
    updateEditMode() {
        if (Array.isArray(this.engines) && this.eventHandler && this.eventHandler.engineName) {
            const engine = this.engines.find(e => e.engineName === this.eventHandler.engineName);
            if (engine) {
                this.editMode = engine.extensions.map(ext => this.maFileStore.getEditMode('.' + ext)).find(m => !!m) ||
                    engine.mimeTypes.map(mime => this.maFileStore.getEditMode(null, mime)).find(m => !!m);
            }
        }
    }
}

export default {
    template: eventHandlerScriptEditorTemplate,
    controller: EventHandlerScriptEditorController,
    bindings: {
        eventHandler: '<'
    },
    require: {
        editor: '^maEventHandlerEditor'
    }
};
