/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['require', 'angular'], function(require, angular) {
'use strict';

AceEditorController.$inject = ['$element', '$injector', '$templateRequest', '$sce', '$scope', '$timeout'];
function AceEditorController($element, $injector, $templateRequest, $sce, $scope, $timeout) {
    this.initialText = $element.data('htmlContent');
    $element.removeData('htmlContent');
    
    var $ctrl = this;
    if (MutationObserver) {
        var observer = new MutationObserver(function() {
            if ($ctrl.editor) {
                $ctrl.editor.resize();
            }
        });
        observer.observe($element[0], {
            attributes: true,
            attributeFilter: ['style']
        });
        $scope.$on('$destroy', function() {
            observer.disconnect();
        });
    }
    
    if ($injector.has('maUiSettings')) {
        this.uiSettings = $injector.get('maUiSettings');
    }
    this.$templateRequest = $templateRequest;
    this.$sce = $sce;
    this.$timeout = $timeout;
}

AceEditorController.prototype.$onInit = function() {
    var $ctrl = this;
    
    this.ngModelCtrl.$render = function() {
        $ctrl.setEditorText(this.$viewValue || '');
    };
    
    this.aceConfig = {
        useWrapMode : true,
        showGutter: !!this.showGutter,
        showPrintMargin: false,
        theme: this.theme || (this.uiSettings && this.uiSettings.codeTheme),
        mode: this.mode || 'html',
        onLoad: this.aceLoaded.bind(this),
        onChange: this.aceChanged.bind(this)
    };
};

AceEditorController.prototype.$onChanges = function(changes) {
    if (changes.src) {
        this.loadFromSrc();
    }
    if (changes.theme) {
        this.setTheme();
    }
    if (changes.mode) {
        this.setMode();
    }
    if (changes.showGutter) {
        this.setShowGutter();
    }
};

AceEditorController.prototype.aceLoaded = function aceLoaded(editor) {
    this.editor = editor;
    editor.$blockScrolling = Infinity;

    if (this.initialText) {
        this.setEditorText(this.initialText);
    }
        
    this.$timeout(function() {
        this.editor.resize();
    }.bind(this), 0);

};

AceEditorController.prototype.aceChanged = function aceChanged() {
    var text = this.editor.getValue();
    this.ngModelCtrl.$setViewValue(text);
};

AceEditorController.prototype.setEditorText = function(text) {
    if (this.editor) {
        this.editor.setValue(text, -1);
    } else {
        this.initialText = text;
    }
};

AceEditorController.prototype.loadFromSrc = function loadFromSrc() {
    if (!this.src) return;
    var $ctrl = this;

    var url = this.$sce.getTrustedResourceUrl(this.src);
    this.$templateRequest(url).then(function(text) {
        $ctrl.setEditorText(text);
    });
};

AceEditorController.prototype.setTheme = function setTheme() {
    if (this.editor && this.theme) {
        this.editor.setTheme('ace/theme/' + this.theme);
    }
};

AceEditorController.prototype.setMode = function setMode() {
    if (this.editor && this.mode) {
        this.editor.getSession().setMode('ace/mode/' + this.mode);
    }
};

AceEditorController.prototype.setShowGutter = function setShowGutter() {
    if (this.editor) {
        this.editor.renderer.setShowGutter(!!this.showGutter);
    }
};

AceEditor.$inject = [];
function AceEditor() {
    return {
        restrict: 'E',
        template: function($element, attrs) {
            var htmlContent = $element.html().trim();
            $element.empty();
            if (htmlContent)
                $element.data('htmlContent', htmlContent);
            return '<div ui-ace="$ctrl.aceConfig"></div>';
        },
        require: {
            'ngModelCtrl': 'ngModel'
        },
        scope: {},
        controllerAs: '$ctrl',
        bindToController: {
            src: '@?',
            mode: '@?',
            theme: '@?',
            showGutter: '<?'
        },
        controller: AceEditorController,
        designerInfo: {
            translation: 'ui.components.aceEditor',
            icon: 'code'
        }
    };
}

return AceEditor;

}); // define
