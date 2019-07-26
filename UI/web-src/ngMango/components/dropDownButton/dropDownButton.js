/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import dropDownButtonTemplate from './dropDownButton.html';
import './dropDownButton.css';

class DropDownButtonController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$scope', '$element', '$injector']; }
    
    constructor($scope, $element, $injector) {
        this.$element = $element;
        
        if ($injector.has('$mdTheming')) {
            $injector.get('$mdTheming')($element);
        }
        
        $element.on('click', event => {
            $scope.$apply(() => {
                this.buttonClicked(event);
            });
        });
    }
    
    $doCheck() {
        const isOpen = !!(this.dropDown && this.dropDown.isOpen());
        if (isOpen !== this.isOpen) {
            if (isOpen) {
                this.$element.addClass('ma-drop-down-open');
            } else {
                this.$element.removeClass('ma-drop-down-open');
            }
        }
        this.isOpen = isOpen;
    }
    
    register(dropDown) {
        this.dropDown = dropDown;
    }
    
    deregister(dropDown) {
        delete this.dropDown;
    }
    
    buttonClicked(event) {
        if (this.$element[0].hasAttribute('disabled')) {
            return;
        }
        if (this.dropDown) {
            this.dropDown.toggleOpen({
                targetElement: event.currentTarget
            });
        }
    }
}

export default {
    template: dropDownButtonTemplate,
    controller: DropDownButtonController,
    transclude: true
};