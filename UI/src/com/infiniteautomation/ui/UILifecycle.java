/**
 * Copyright (C) 2017 Infinite Automation Software. All rights reserved.
 */
package com.infiniteautomation.ui;

import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.serotonin.m2m2.db.dao.JsonDataDao;
import com.serotonin.m2m2.module.ModuleElementDefinition;
import com.serotonin.m2m2.vo.json.JsonDataVO;

/**
 * @author Jared Wiltshire
 *
 */
public class UILifecycle extends ModuleElementDefinition {
    // must match variables defined in web/ui/app.js
    private static final String MA_UI_MENU_XID = "mangoUI-menu";
    private static final String MA_UI_PAGES_XID = "mangoUI-pages";
    private static final String MA_UI_SETTINGS_XID = "mangoUI-settings";
    private static final String MA_UI_EDIT_MENUS_PERMISSION = "edit-ui-menus";
    private static final String MA_UI_EDIT_PAGES_PERMISSION = "edit-ui-pages";
    private static final String MA_UI_EDIT_SETTINGS_PERMISSION = "edit-ui-settings";
    private static final String MA_UI_DEFAULT_READ_PERMISSION = "user";
    
    private JsonNodeFactory nodeFactory;

    public UILifecycle() {
        this.nodeFactory = JsonNodeFactory.withExactBigDecimals(false);
    }
    
    @Override
    public void postInitialize(boolean install, boolean upgrade) {
        installMenuData();
        installPageData();
        installSettingsData();
    }
    
    public void installMenuData() {
        JsonDataVO menu = JsonDataDao.instance.getByXid(MA_UI_MENU_XID);
        if (menu == null) {
            menu = new JsonDataVO();
            menu.setXid(MA_UI_MENU_XID);
            menu.setName("UI Menu");
            menu.setPublicData(false);
            menu.setReadPermission(MA_UI_DEFAULT_READ_PERMISSION);
            menu.setEditPermission(MA_UI_EDIT_MENUS_PERMISSION);
        }
        
        if (menu.getJsonData() == null) {
            ObjectNode object = nodeFactory.objectNode();
            object.set("menuItems", nodeFactory.arrayNode());
            menu.setJsonData(object);
        }
        
        JsonDataDao.instance.save(menu);
    }
    
    public void installPageData() {
        JsonDataVO menu = JsonDataDao.instance.getByXid(MA_UI_PAGES_XID);
        if (menu == null) {
            menu = new JsonDataVO();
            menu.setXid(MA_UI_PAGES_XID);
            menu.setName("UI Pages");
            menu.setPublicData(false);
            menu.setReadPermission(MA_UI_DEFAULT_READ_PERMISSION);
            menu.setEditPermission(MA_UI_EDIT_PAGES_PERMISSION);
        }
        
        if (menu.getJsonData() == null) {
            ObjectNode object = nodeFactory.objectNode();
            object.set("pages", nodeFactory.arrayNode());
            menu.setJsonData(object);
        }
        
        JsonDataDao.instance.save(menu);
    }
    
    public void installSettingsData() {
        JsonDataVO menu = JsonDataDao.instance.getByXid(MA_UI_SETTINGS_XID);
        if (menu == null) {
            menu = new JsonDataVO();
            menu.setXid(MA_UI_SETTINGS_XID);
            menu.setName("UI Settings");
            menu.setPublicData(true);
            menu.setReadPermission(MA_UI_DEFAULT_READ_PERMISSION);
            menu.setEditPermission(MA_UI_EDIT_SETTINGS_PERMISSION);
        }
        
        if (menu.getJsonData() == null) {
            ObjectNode object = nodeFactory.objectNode();
            menu.setJsonData(object);
        }
        
        JsonDataDao.instance.save(menu);
    }
}
