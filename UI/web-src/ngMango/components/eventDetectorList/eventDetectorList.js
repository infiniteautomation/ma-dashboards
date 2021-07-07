/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import eventDetectorListTemplate from './eventDetectorList.html';
import './eventDetectorList.css';

/**
 * @ngdoc directive
 * @name ngMango.directive:maEventDetectorList
 * @restrict E
 * @description Displays a list of event detectors
 */

class EventDetectorListController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maEventDetector', '$scope']; }
    
    constructor(EventDetector, $scope) {
        this.EventDetector = EventDetector;
        this.$scope = $scope;
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
        
        this.doQuery();
        
        this.EventDetector.subscribe((event, item, attributes) => {
            if (!this.eventDetectors) return;

            const itemId = attributes.itemId;

            const index = this.eventDetectors.findIndex(eventDetector => eventDetector.id === itemId);
            if (index >= 0) {
                if (event.name === 'update' || event.name === 'create') {
                    this.eventDetectors[index] = item;
                } else if (event.name === 'delete') {
                    this.eventDetectors.splice(index, 1);
                }
            } else if (event.name === 'update' || event.name === 'create') {
                if (this.dataPoint) {
                    if (item.sourceTypeName === 'DATA_POINT' && item.sourceId === this.dataPoint.id) {
                        this.eventDetectors.push(item);
                    }
                } else {
                    this.eventDetectors.push(item);
                }
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
        
        if (this.selected === null) {
            this.newEventDetector();
        }
    }
    
    selectEventDetector(eventDetector) {
        if (this.selected === eventDetector) {
            // create a shallow copy if this eventDetector is already selected
            // causes the model to update
            this.selected = Object.assign(Object.create(this.EventDetector.prototype), eventDetector);
        } else {
            this.selected = eventDetector;
        }
        
        this.setViewValue();
    }
    
    newEventDetector(event) {
        if (this.dataPoint) {
            this.selected = this.EventDetector.forDataPoint(this.dataPoint);
        } else {
            this.selected = new this.EventDetector();
        }
        this.setViewValue();
    }
}

export default {
    template: eventDetectorListTemplate,
    controller: EventDetectorListController,
    bindings: {
        dataPoint: '<?point',
        onQuery: '&?'
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    designerInfo: {
        translation: 'ui.components.eventDetectorList',
        icon: 'change_history'
    }
};
