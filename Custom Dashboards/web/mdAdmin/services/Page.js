/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';

function PageFactory(JsonStore, CUSTOM_USER_PAGES_XID, Util, DEFAULT_PAGES, $q) {

    function Page() {
        this.defaultPages = [];
        this.xidToPageMap = {};
        
        for (var i = 0; i < DEFAULT_PAGES.length; i++) {
            var pageSummary = DEFAULT_PAGES[i];
            
            var page = new JsonStore();
            page.xid = pageSummary.xid;
            page.name = pageSummary.name;
            page.jsonData = {
                markup: pageSummary.markup
            };
            page.editPermission = pageSummary.editPermission;
            page.readPermission = pageSummary.readPermission;
            
            this.xidToPageMap[page.xid] = page;
            
            delete pageSummary.markup;
            this.defaultPages.push(pageSummary);
        }
    }
    
    Page.prototype.getPages = function getPages() {
        return JsonStore.get({
            xid: CUSTOM_USER_PAGES_XID
        }).$promise.then(null, function() {
            return this.getDefaultPages();
        }.bind(this));
    };
    
    Page.prototype.getDefaultPages = function getDefaultPages() {
        var storeObject = new JsonStore();
        storeObject.xid = CUSTOM_USER_PAGES_XID;
        storeObject.name = CUSTOM_USER_PAGES_XID;
        storeObject.jsonData = {
            pages: this.defaultPages
        };
        storeObject.editPermission = 'edit-pages';
        storeObject.readPermission = 'user';
        
        return storeObject;
    };
    
    Page.prototype.loadPage = function loadPage(xid) {
        return JsonStore.get({
            xid: xid
        }).$promise.then(null, function(error) {
            var page = this.xidToPageMap[xid];
            return page ? page : $q.reject(error);
        }.bind(this));
    };
    
    Page.prototype.newPageContent = function newPageContent() {
        var storeObject = new JsonStore();
        storeObject.xid = Util.uuid();
        storeObject.jsonData = {
            markup: ''
        };
        storeObject.editPermission = 'edit-pages';
        storeObject.readPermission = 'user';
        storeObject.isNew = true;
        return storeObject;
    };

    return new Page();
}

PageFactory.$inject = ['JsonStore', 'CUSTOM_USER_PAGES_XID', 'Util', 'DEFAULT_PAGES', '$q'];
return PageFactory;

}); // define
