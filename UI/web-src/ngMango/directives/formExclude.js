/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

formExclude.$inject = ['$document'];
function formExclude($document) {
    const excludeAttr = 'ma-form-exclude';
    const excludeParentValue = 'parent';
    
    return {
        require: {
            modelCtrl: '?ngModel',
            formCtrl: '?form'
        },
        restrict: 'A',
        link: function($scope, $element, $attrs, ctrls) {
            const modelCtrl = ctrls.modelCtrl;
            const formCtrl = ctrls.formCtrl;
            const thisElement = $element[0];

            if ($attrs.maFormExclude === excludeParentValue) {
                const formExcludes = $document[0].querySelectorAll(`[${excludeAttr}]`);
                const parentExcluded = Array.prototype.some.call(formExcludes, el => {
                    return el !== thisElement && el.contains(thisElement) && el.getAttribute(excludeAttr) !== excludeParentValue;
                });
                if (!parentExcluded) {
                    return;
                }
            }

            if (modelCtrl) {
                modelCtrl.$$parentForm.$removeControl(modelCtrl);
            }
            if (formCtrl) {
                formCtrl.$$parentForm.$removeControl(formCtrl);
            }
        }
    };
}

export default formExclude;