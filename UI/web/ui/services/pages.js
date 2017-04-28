/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular'], function(angular) {
'use strict';

PageFactory.$inject = ['maJsonStore', 'MA_UI_PAGES_XID', 'maUtil', '$q', 'MA_UI_EDIT_PAGES_PERMISSION'];
function PageFactory(JsonStore, MA_UI_PAGES_XID, Util, $q, MA_UI_EDIT_PAGES_PERMISSION) {

    function Page() {
    }
    
    Page.prototype.getPages = function getPages() {
        return JsonStore.get({
            xid: MA_UI_PAGES_XID
        }).$promise.then(null, function() {
            return this.getDefaultPages();
        }.bind(this));
    };
    
    Page.prototype.getDefaultPages = function getDefaultPages() {
        var storeObject = new JsonStore();
        storeObject.xid = MA_UI_PAGES_XID;
        storeObject.name = MA_UI_PAGES_XID;
        storeObject.jsonData = {
            pages: []
        };
        storeObject.editPermission = MA_UI_EDIT_PAGES_PERMISSION;
        storeObject.readPermission = 'user';
        storeObject.publicData = false;
        
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
        storeObject.editPermission = MA_UI_EDIT_PAGES_PERMISSION;
        storeObject.readPermission = 'user';
        storeObject.publicData = false;
        storeObject.isNew = true;
        return storeObject;
    };

    return new Page();
}

return PageFactory;

}); // define
