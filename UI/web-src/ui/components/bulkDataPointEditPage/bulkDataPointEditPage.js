/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import bulkDataPointEditPageTemplate from './bulkDataPointEditPage.html';
import './bulkDataPointEditPage.css';

class BulkDataPointEditPageController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maDialogHelper', 'maWatchList', '$q']; }
    
    constructor(maDialogHelper, maWatchList, $q) {
        this.maDialogHelper = maDialogHelper;
        this.maWatchList = maWatchList;
        this.$q = $q;
        
        this.browserOpen = true;
        this.watchListParams = {};
    }

    $onInit() {
        this.maWatchList.objQuery({
            limit: 1,
            sort: 'name'
        }).$promise.then(lists => {
            if (lists.length) {
                this.watchList = lists[0];
                this.watchListChanged();
            }
        });
    }

    $onChanges(changes) {
    }

    watchListChanged() {
        if (this.watchList) {
            this.watchList.defaultParamValues(this.watchListParams);
        }
    }
}

export default {
    template: bulkDataPointEditPageTemplate,
    controller: BulkDataPointEditPageController,
    bindings: {
    },
    require: {
    }
};