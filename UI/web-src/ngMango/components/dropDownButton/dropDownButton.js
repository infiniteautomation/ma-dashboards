/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import dropDownButtonTemplate from './dropDownButton.html';
import './dropDownButton.css';

class DropDownButtonController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$scope', '$element', '$attrs', '$injector']; }
    
    constructor($scope, $element, $attrs, $injector) {
        this.$element = $element;
        this.$injector = $injector;

        const listener = event => {
            if (event.type === 'click' || (event.type === 'keydown' && ['Enter', ' '].includes(event.key))) {
                event.preventDefault();
                $scope.$apply(() => {
                    this.buttonClicked(event);
                });
            }
        };
        $element[0].addEventListener('click', listener);
        $element[0].addEventListener('keydown', listener);

        $element.attr('role', 'button');
        $element.attr('tabindex', '0');

        this.disabled = false;
        $attrs.$observe('disabled', (value) => {
            const disabled = typeof value === 'string' || !!value;
            if (this.disabled !== disabled) {
                this.disabled = disabled;
                $element.attr('tabindex', this.disabled ? '-1' : '0');
            }
        });
    }
    
    $onInit() {
        if (this.containerCtrl) {
            this.configureInputContainer();
        }
        
        if (!this.containerCtrl && this.$injector.has('$mdButtonInkRipple')) {
            this.$injector.get('$mdButtonInkRipple').attach(this.$scope, this.$element);
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
                this.setContainerFocusedState();
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
        const setContainerFocusedState = () => this.setContainerFocusedState();
        this.$element[0].addEventListener('focus', setContainerFocusedState);
        this.$element[0].addEventListener('blur', setContainerFocusedState);
    }
    
    setContainerFocusedState() {
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