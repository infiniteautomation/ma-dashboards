/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import eventDetectorSelectTemplate from './eventDetectorSelect.html';
import './eventDetectorSelect.css';

/**
 * @ngdoc directive
 * @name ngMango.directive:EventDetectorSelect
 * @restrict E
 * @description Displays a drop down select of event handlers
 */

class EventDetectorSelectController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maEventDetector', '$scope']; }
    
    constructor(EventDetector, $scope) {
        this.EventDetector = EventDetector;
        this.$scope = $scope;
        
        this.newValue = {};
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();

        this.doQuery();
        
        this.EventDetector.subscribe((event, item, originalXid) => {
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
        if (changes.dataPoint && !changes.dataPoint.isFirstChange()) {
            this.doQuery();
        }
    }
    
    doQuery() {
        const query = this.EventDetector.buildQuery();
        
        if (this.dataPoint) {
            query.eq('sourceTypeName', 'DATA_POINT');
            query.eq('dataPointId', this.dataPoint.id);
        }
        
        query.query().then(eventDetectors => {
            this.eventDetectors = eventDetectors;
            
            if (typeof this.onQuery === 'function') {
                this.onQuery({$items: this.eventDetectors});
            }
        });
    }
    
    setViewValue() {
        this.ngModelCtrl.$setViewValue(this.selected);
    }
    
    render() {
        this.selected = this.ngModelCtrl.$viewValue;
    }
    
    selectEventDetector() {
        if (this.selected === this.newValue) {
            this.selected = this.newEventDetector();
        }
        this.setViewValue();
    }
    
    newEventDetector(event) {
        this.selected = new this.EventDetector();
        if (this.dataPoint) {
            this.selected.sourceTypeName = 'DATA_POINT';
            this.selected.dataPoint = this.dataPoint;
            this.selected.sourceId = this.dataPoint.id;
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
        showNewOption: '<?',
        dataPoint: '<?point',
        onQuery: '&?'
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    designerInfo: {
        translation: 'ui.components.eventDetectorSelect',
        icon: 'assignment_turned_in'
    }
};
