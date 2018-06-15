/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */


LivePreviewController.$inject = ['$scope', '$compile', '$element'];
function LivePreviewController($scope, $compile, $element) {
    this.$scope = $scope;
    this.$compile = $compile;
    this.$element = $element;
    this.childScope = null;
}

LivePreviewController.prototype.$onChanges = function(changes) {
    if (changes.livePreview) {
        this.updatePreview();
    }
};

LivePreviewController.prototype.updatePreview = function updatePreview() {
    if (this.childScope) {
        this.childScope.$destroy();
        this.childScope = null;
    }
    
    if (this.livePreview) {
        this.childScope = this.$scope.$new();
        const compileText = '<div>' + this.livePreview + '</div>';
        const $div = this.$compile(compileText)(this.childScope);
        this.$element.html($div.contents());
    } else {
        this.$element.empty();
    }
};

LivePreview.$inject = [];
function LivePreview() {
    return {
        scope: false,
        bindToController: {
            livePreview: '<maUiLivePreview'
        },
        controller: LivePreviewController
    };
}

export default LivePreview;


