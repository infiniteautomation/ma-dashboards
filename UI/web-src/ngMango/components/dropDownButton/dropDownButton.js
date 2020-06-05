/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';
import dropDownButtonTemplate from './dropDownButton.html';
import './dropDownButton.css';

class DropDownButtonController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$scope', '$element', 'maUtil', '$attrs']; }
    
    constructor($scope, $element, maUtil, $attrs) {
        this.$element = $element;
        this.maUtil = maUtil;

        $element.on('click keypress', event => {
            if (event.type === 'click' || [13, 32].includes(event.which)) {
                $scope.$apply(() => {
                    this.buttonClicked(event);
                });
            }
        });

        $element.attr('role', 'button');
        $element.attr('tabindex', '0');
        this.disabled = false;
        
        $attrs.$observe('disabled', disabled => {
            this.disabled = disabled;
            $element.attr('tabindex', disabled ? '-1' : '0');
        });
    }
    
    $onInit() {
        if (this.containerCtrl) {
            this.configureInputContainer();
        }
    }

    $doCheck() {
        const isOpen = !!(this.dropDown && this.dropDown.isOpen());
        if (isOpen !== this.isOpen) {
            if (isOpen) {
                this.$element.addClass('ma-drop-down-open');
            } else {
                this.$element.removeClass('ma-drop-down-open');
            }
            this.isOpen = isOpen;
            if (this.containerCtrl) {
                this.setFocused();
            }
        }
    }
    
    register(dropDown) {
        this.dropDown = dropDown;
    }
    
    deregister(dropDown) {
        delete this.dropDown;
    }
    
    buttonClicked(event) {
        if (!this.disabled && this.dropDown) {
            this.dropDown.toggleOpen({
                targetElement: event.currentTarget
            });
        }
    }
    
    configureInputContainer() {
        const containerCtrl = this.containerCtrl;
        const $element = this.$element;
        const $container = this.$element.parent();
        
        if ($container.maFind(':scope > ma-drop-down-button ~ md-icon').length) {
            $container.addClass('md-icon-right');
        } else if ($container.maFind(':scope > md-icon ~ ma-drop-down-button').length) {
            $container.addClass('md-icon-left');
        }
        // TODO should we do this?
        $container.addClass('md-input-has-value');

        $element.after(angular.element('<div class="md-errors-spacer">'));
        
        containerCtrl.input = $element;
        if (!$element.attr('id')) {
            $element.attr('id', 'input_' + this.maUtil.uuid());
        }
        
        $element.on('focus blur', () => this.setFocused());
    }
    
    setFocused() {
        this.containerCtrl.setFocused(!this.disabled && (this.isOpen || this.$element.maHasFocus()));
    }
}

export default {
    template: dropDownButtonTemplate,
    controller: DropDownButtonController,
    transclude: true,
    require: {
        containerCtrl: '?^^mdInputContainer'
    }
};