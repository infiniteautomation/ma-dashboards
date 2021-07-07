/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import publisherListTemplate from './publisherList.html';

/**
 * @ngdoc directive
 * @name ngMango.directive:maPublisherList
 * @restrict E
 * @description Displays a list of publishers
 */

const DEFAULT_SORT = ['name'];

class PublisherListController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maPublisher', '$scope', '$filter']; }
    
    constructor(maPublisher, $scope, $filter) {
        this.maPublisher = maPublisher;
        this.$scope = $scope;
        this.$filter = $filter;
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
        
        this.doQuery();
        
        this.maPublisher.subscribe({
            scope: this.$scope,
            handler: (event, item, attributes) => {
                if (Array.isArray(this.preFilterItems)) {
                    attributes.updateArray(this.preFilterItems);
                    this.filterList();
                }
            }
        });
    }

    $onChanges(changes) {
        if (changes.filter && !changes.filter.isFirstChange() || changes.sort && !changes.sort.isFirstChange()) {
            this.filterList();
        }
    }
    
    doQuery() {
        const queryPromise = this.maPublisher.buildQuery() // TODO this is a unbounded query
            .query()
            .then(items => {
                this.preFilterItems = items;
                return this.filterList();
            }).finally(() => {
                if (this.queryPromise === queryPromise) {
                    delete this.queryPromise;
                }
            });
        
        return (this.queryPromise = queryPromise);
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

    filterList() {
        if (!Array.isArray(this.preFilterItems)) {
            return;
        }
        
        let items = this.preFilterItems.filter(this.createFilter());
        items = this.$filter('orderBy')(items, this.sort || DEFAULT_SORT);
        return (this.items = items);
    }
    
    createFilter() {
        if (!this.filter) return (item) => true;

        let filter = this.filter.toLowerCase();
        if (!filter.startsWith('*')) {
            filter = '*' + filter;
        }
        if (!filter.endsWith('*')) {
            filter = filter + '*';
        }
        filter = filter.replace(/\*/g, '.*');
        const regex = new RegExp(filter, 'i');
        
        return (item) => {
            return regex.test(item.name) || regex.test(item.description) || regex.test(item.connectionDescription);
        };
    }
}

export default {
    template: publisherListTemplate,
    controller: PublisherListController,
    bindings: {
        showNew: '<?',
        showEnableSwitch: '<?',
        hideSwitchOnSelected: '<?',
        sort: '<?',
        filter: '<?'
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    designerInfo: {
        translation: 'ui.components.publisherList',
        icon: 'assignment_turned_in'
    }
};
