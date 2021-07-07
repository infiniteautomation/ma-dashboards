/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import dualPaneEditorTemplate from './dualPaneEditor.html';
import './dualPaneEditor.css';

const dualPaneEditor = function() {
    return {
        template: function($element, attrs) {
            const htmlContent = $element.html().trim();
            $element.empty();
            if (htmlContent)
                $element.data('htmlContent', htmlContent);
            return dualPaneEditorTemplate;
        },
        link: function($scope, $element, $attrs) {
            let content = $element.data('htmlContent');
            $element.removeData('htmlContent');
            content = content.replace(new RegExp('=""', 'g'),'');
            $scope.text = content;
        }
    };
};

dualPaneEditor.$inject = [];

export default dualPaneEditor;


