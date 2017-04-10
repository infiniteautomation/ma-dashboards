/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';

function PageFactory(JsonStore, CUSTOM_USER_PAGES_XID, Util, $q) {

    function Page() {
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
            pages: []
        };
        storeObject.editPermission = 'edit-pages';
        storeObject.readPermission = 'user';
        
        return storeObject;
    };
    
    Page.prototype.loadPage = function loadPage(xid) {
        return JsonStore.get({
            xid: xid
        }).$promise.then(null, function(error) {
            this.getPages().then(function(pagesStore) {
                var pages = pagesStore.jsonData.pages;
                for (var i = 0; i < pages.length;) {
                    if (pages[i].xid === xid) {
                        pages.splice(i, 1);
                        continue;
                    }
                    i++;
                }
                pagesStore.$save();
            });
            return $q.reject(error);
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

PageFactory.$inject = ['JsonStore', 'CUSTOM_USER_PAGES_XID', 'Util', '$q'];
return PageFactory;

}); // define
