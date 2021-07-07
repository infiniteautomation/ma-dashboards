/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import dataSourcePageTemplate from './dataSourcePage.html';
import './dataSourcePage.css';

class DataSourcePageController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maDataSource', '$state', '$mdMedia', 'maUser']; }
    
    constructor(maDataSource, $state, $mdMedia, User) {
        this.maDataSource = maDataSource;
        this.$state = $state;
        this.$mdMedia = $mdMedia;
        this.User = User;
    }
    
    $onInit() {
        if (this.$state.params.xid) {
            this.maDataSource.get({xid: this.$state.params.xid}).$promise.then(item => {
                this.dataSource = item;
            }, error => {
                this.newDataSource();
            });
        } else if (this.$state.params.dataSourceId != null) {
            this.maDataSource.getById({id: this.$state.params.dataSourceId}).$promise.then(item => {
                this.dataSource = item;
            }, error => {
                this.newDataSource();
            });
        } else {
            this.newDataSource();
        }
    }
    
    $onChanges(changes) {
    }
    
    newDataSource() {
        if (!this.User.current.hasSystemPermission('permissionDatasource')) {
            return;
        }
        
        const dsTypes = this.maDataSource.types;
        if (dsTypes.length) {
            this.dataSource = dsTypes[0].createDataSource();
        } else {
            this.dataSource = new this.maDataSource();
        }
        this.dataSourceChanged();
    }
    
    dataSourceSaved() {
        if (this.dataSource == null) {
            // user deleted the data source
            this.dataSource = new this.maDataSource();
        }
        
        // always update the state params, xids can change
        this.dataSourceChanged();
    }
    
    dataSourceChanged() {
        this.$state.params.dataSourceId = null;
        this.$state.params.xid = this.dataSource && !this.dataSource.isNew() && this.dataSource.xid || null;
        this.$state.go('.', this.$state.params, {location: 'replace', notify: false});
    }
}

export default {
    template: dataSourcePageTemplate,
    controller: DataSourcePageController,
    bindings: {
    },
    require: {
    }
};
