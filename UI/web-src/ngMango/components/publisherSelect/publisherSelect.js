/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import publisherSelectTemplate from './publisherSelect.html';

/**
 * @ngdoc directive
 * @name ngMango.directive:maPublisherSelect
 * @restrict E
 * @description Displays a drop down select of publishers
 */

class PublisherSelectController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maPublisher', '$scope']; }
    
    constructor(maPublisher, $scope) {
        this.maPublisher = maPublisher;
        this.$scope = $scope;
        
        this.newValue = {};
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
        
        this.doQuery();
        
        this.maPublisher.subscribe({
            scope: this.$scope,
            handler: (event, item, attributes) => {
                attributes.updateArray(this.publishers);
            }
        });
    }
    
    $onChanges(changes) {
    }
    
    doQuery() {
        const queryBuilder = this.maPublisher.buildQuery(); // TODO this is a unbounded query
        return queryBuilder.query().then(publishers => {
            return (this.publishers = publishers);
        });
    }
    
    setViewValue() {
        this.ngModelCtrl.$setViewValue(this.selected);
    }
    
    render() {
        this.selected = this.ngModelCtrl.$viewValue;
    }
    
    selectPublisher() {
        if (this.selected === this.newValue) {
            this.selected = new this.maPublisher();
        }
        this.setViewValue();
    }
}

export default {
    template: publisherSelectTemplate,
    controller: PublisherSelectController,
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
        translation: 'ui.components.publisherSelect',
        icon: 'link'
    }
};
