/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import pageTemplate from './adminHomePage.html';
import './adminHomePage.css';

import sqlSvg from './svgs/sql-icon.svg'
import noSqlSvg from './svgs/nosql-icon.svg'
import diskspaceSvg from './svgs/diskspace-icon.svg'
import ramSvg from './svgs/ram-icon.svg'
import cpuloadSvg from './svgs/cpuload-icon.svg'

class PageController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$q','$mdMedia','maSystemStatus', 'maUiDateBar', 'maUiPages', '$injector', 'maUiMenu', 'maUser', 'maEvents', 'maUiServerInfo']; }
    
    constructor($q, $mdMedia, systemStatus, maUiDateBar,  maUiPages, $injector, maUiMenu, maUser, maEvents, maUiServerInfo) {
        this.systemStatus = systemStatus
        this.maUiDateBar = maUiDateBar
        this.maUiPages = maUiPages;
        this.$injector = $injector;
        this.maUiMenu = maUiMenu;
        this.maUser = maUser;
        this.maEvents = maEvents
        this.maUiServerInfo = maUiServerInfo
        this.$q = $q;
        this.$mdMedia = $mdMedia;
        this.sqlSvg = sqlSvg
        this.noSqlSvg = noSqlSvg
        this.diskspaceSvg = diskspaceSvg
        this.ramSvg = ramSvg
        this.cpuloadSvg = cpuloadSvg
    }
    
    $onInit() {
        this.eventCounts = {}
        this.maUiPages.getPages().then(store => {
            this.pageCount = store.jsonData.pages.length;
        });
        
        this.hasDashboardDesigner = !!this.$injector.modules.maDashboardDesigner;
        
        this.maUiMenu.getMenu().then(menu => {
            this.utilityMenuItems = menu.filter(item => item.showInUtilities);
        });
        this.systemStatus.getInternalMetrics().then((response) => {
            this.internalMetrics = response.data;
        });
        this.getCounts()
    }

    getCounts() {
        const promises = [
            this.getCount('DATA_POINT'),
            this.getCount('SYSTEM'),
            this.getCount('ADVANCED_SCHEDULE')
        ];
        this.$q.all(promises).then(([count1, count2, count3]) => {
            this.eventCounts.dataPoint = count1
            this.eventCounts.system = count2
            this.eventCounts.advancedSchedule = count3
        });
    }

    getCount(eventType) {
        return this.maEvents.buildQuery()
            .eq('eventType', eventType)
            .eq('active', true)
            .limit(0)
            .query().then(result => {
                return result.$total;
            });
    }
}

export default {
    controller: PageController,
    template: pageTemplate
};
