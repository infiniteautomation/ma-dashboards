/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import eventDetectorSelectTemplate from './eventDetectorSelect.html';
import './eventDetectorSelect.css';

/**
 * @ngdoc directive
 * @name ngMango.directive:maEventDetectorSelect
 * @restrict E
 * @description Displays a drop down select of event handlers
 */

class EventDetectorSelectController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maEventDetector', '$scope']; }
    
    constructor(maEventDetector, $scope) {
        this.maEventDetector = maEventDetector;
        this.$scope = $scope;
        
        this.newValue = {};
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
        
        this.maEventDetector.list().then((eventDetectors) => {
            this.eventDetectors = eventDetectors;
        });
        
        this.maEventDetector.subscribe((event, item, originalXid) => {
            if (!this.eventDetectors) return;

            const index = this.eventDetectors.findIndex(eventDetector => eventDetector.id === item.id);
            if (index >= 0) {
                if (event.name === 'update' || event.name === 'create') {
                    this.eventDetectors[index] = item;
                } else if (event.name === 'delete') {
                    this.eventDetectors.splice(index, 1);
                }
            } else if (event.name === 'update' || event.name === 'create') {
                this.eventDetectors.push(item);
            }

        }, this.$scope, ['create', 'update', 'delete']);
    }
    
    $onChanges(changes) {
    }
    
    setViewValue() {
        this.ngModelCtrl.$setViewValue(this.selected);
    }
    
    render() {
        this.selected = this.ngModelCtrl.$viewValue;
    }
    
    selectEventDetector() {
        if (this.selected === this.newValue) {
            this.selected = new this.maEventDetector();
        }
        this.setViewValue();
    }
}

export default {
    template: eventDetectorSelectTemplate,
    controller: EventDetectorSelectController,
    transclude: {
        labelSlot: '?maLabel'
    },
    bindings: {
        showNewOption: '<?'
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    designerInfo: {
        translation: 'ui.components.eventDetectorSelect',
        icon: 'link'
    }
};
