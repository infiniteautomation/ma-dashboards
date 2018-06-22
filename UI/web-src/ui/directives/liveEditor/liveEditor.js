/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

// TODO Mango 3.5 remove this directive (Replaced by aceEditor.js in ngMango)

LiveEditorController.$inject = ['$element', 'maUiSettings', '$templateRequest', '$sce', '$scope', '$timeout'];
function LiveEditorController($element, uiSettings, $templateRequest, $sce, $scope, $timeout) {
    this.initialText = $element.data('htmlContent');
    $element.removeData('htmlContent');
    
    const $ctrl = this;
    if (MutationObserver) {
        const observer = new MutationObserver(function() {
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
    
    this.uiSettings = uiSettings;
    this.$templateRequest = $templateRequest;
    this.$sce = $sce;
    this.$timeout = $timeout;
}

LiveEditorController.prototype.$onInit = function() {
    const $ctrl = this;
    
    this.ngModelCtrl.$render = function() {
        $ctrl.setEditorText(this.$viewValue || '');
    };
    
    this.aceConfig = {
        useWrapMode : true,
        showGutter: false,
        showPrintMargin: false,
        theme: this.theme || this.uiSettings.codeTheme,
        mode: this.mode || 'html',
        onLoad: this.aceLoaded.bind(this),
        onChange: this.aceChanged.bind(this)
    };
};

LiveEditorController.prototype.$onChanges = function(changes) {
    if (changes.src) {
        this.loadFromSrc();
    }
    if (changes.theme) {
        this.setTheme();
    }
};

LiveEditorController.prototype.aceLoaded = function aceLoaded(editor) {
    this.editor = editor;
    editor.$blockScrolling = Infinity;

    if (this.initialText) {
        this.setEditorText(this.initialText);
    }
        
    this.$timeout(function() {
        this.editor.resize();
    }.bind(this), 0);

};

LiveEditorController.prototype.aceChanged = function aceChanged() {
    const text = this.editor.getValue();
    this.ngModelCtrl.$setViewValue(text);
};

LiveEditorController.prototype.setEditorText = function(text) {
    if (this.editor) {
        this.editor.setValue(text, -1);
    } else {
        this.initialText = text;
    }
};

LiveEditorController.prototype.loadFromSrc = function loadFromSrc() {
    if (!this.src) return;
    const $ctrl = this;

    const url = this.$sce.getTrustedResourceUrl(this.src);
    this.$templateRequest(url).then(function(text) {
        $ctrl.setEditorText(text);
    });
};

LiveEditorController.prototype.setTheme = function setTheme() {
    if (this.editor && this.theme) {
        this.editor.setTheme('ace/theme/' + this.theme);
    }
};

LiveEditor.$inject = [];
function LiveEditor() {
    return {
        restrict: 'E',
        template: function($element, attrs) {
            const htmlContent = $element.html().trim();
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
            src: '@',
            mode: '@',
            theme: '@'
        },
        controller: LiveEditorController
    };
}

export default LiveEditor;


