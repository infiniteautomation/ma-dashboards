/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import angular from 'angular';


function DynamicItemsFactory() {
    const DEFAULT_PAGE_SIZE = 20;
    
    function DynamicItems(config) {
        this.loadedPages = {};
        this.numItems = 0;
        this.pageSize = DEFAULT_PAGE_SIZE;
        angular.merge(this, config);
        this.fetchPage(0);
    }

    DynamicItems.prototype.getItemAtIndex = function getItemAtIndex(index) {
        const pageNumber = Math.floor(index / this.pageSize);
        const page = this.loadedPages[pageNumber];
        if (page) {
            return page[index % this.pageSize];
        } else if (page !== null) {
            this.fetchPage(pageNumber);
        }
    };

    DynamicItems.prototype.getLength = function getLength() {
        return this.numItems;
    };

    DynamicItems.prototype.fetchPage = function fetchPage(pageNumber) {
        this.loadedPages[pageNumber] = null;
        
        this.queryPromise = this.doQuery(this.pageSize, pageNumber * this.pageSize).then(function(items) {
            this.loadedPages[pageNumber] = items;
            this.numItems = items.$total;
            return items;
        }.bind(this)).then(this.querySuccess, this.queryFailure);
        
        if (typeof this.onQuery === 'function') {
            this.onQuery(this.queryPromise);
        }
        
        return this.queryPromise;
    };
    
    DynamicItems.prototype.doQuery = function doQuery(limit, offset) {
        return this.service.objQuery({limit: limit, offset: offset, sort: this.sort}).$promise;
    };

    return DynamicItems;
}

DynamicItemsFactory.$inject = [];
export default DynamicItemsFactory;


