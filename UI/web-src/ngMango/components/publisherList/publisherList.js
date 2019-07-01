/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import publisherListTemplate from './publisherList.html';

/**
 * @ngdoc directive
 * @name ngMango.directive:maPublisherList
 * @restrict E
 * @description Displays a list of publishers
 */

class PublisherListController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maPublisher', '$scope']; }
    
    constructor(maPublisher, $scope) {
        this.maPublisher = maPublisher;
        this.$scope = $scope;
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
        const queryBuilder = this.maPublisher.buildQuery();
        queryBuilder.limit(10000);
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
    
    selectPublisher(publisher) {
        if (this.selected === publisher) {
            // create a shallow copy if this publisher is already selected
            // causes the model to update
            this.selected = Object.assign(Object.create(this.maPublisher.prototype), publisher);
        } else {
            this.selected = publisher;
        }
        
        this.setViewValue();
    }
    
    newPublisher(event) {
        this.selected = new this.maPublisher();
        this.setViewValue();
    }
}

export default {
    template: publisherListTemplate,
    controller: PublisherListController,
    bindings: {
        showEnableSwitch: '<?',
        hideSwitchOnSelected: '<?'
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    designerInfo: {
        translation: 'ui.components.publisherList',
        icon: 'assignment_turned_in'
    }
};
