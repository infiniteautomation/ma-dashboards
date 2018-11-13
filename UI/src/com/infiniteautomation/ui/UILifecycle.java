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
    public static final String MA_UI_MENU_XID = "mangoUI-menu";
    public static final String MA_UI_PAGES_XID = "mangoUI-pages";
    public static final String MA_UI_SETTINGS_XID = "mangoUI-settings";
    public static final String MA_UI_EDIT_MENUS_PERMISSION = "edit-ui-menus";
    public static final String MA_UI_EDIT_PAGES_PERMISSION = "edit-ui-pages";
    public static final String MA_UI_EDIT_SETTINGS_PERMISSION = "edit-ui-settings";
    public static final String MA_UI_DEFAULT_READ_PERMISSION = "user";

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
        JsonDataVO menu = JsonDataDao.getInstance().getByXid(MA_UI_MENU_XID);
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

        JsonDataDao.getInstance().save(menu);
    }

    public void installPageData() {
        JsonDataVO pages = JsonDataDao.getInstance().getByXid(MA_UI_PAGES_XID);
        if (pages == null) {
            pages = new JsonDataVO();
            pages.setXid(MA_UI_PAGES_XID);
            pages.setName("UI Pages");
            pages.setPublicData(false);
            pages.setReadPermission(MA_UI_DEFAULT_READ_PERMISSION);
            pages.setEditPermission(MA_UI_EDIT_PAGES_PERMISSION);
        }

        if (pages.getJsonData() == null) {
            ObjectNode object = nodeFactory.objectNode();
            object.set("pages", nodeFactory.arrayNode());
            pages.setJsonData(object);
        }

        JsonDataDao.getInstance().save(pages);
    }

    public void installSettingsData() {
        JsonDataVO settings = JsonDataDao.getInstance().getByXid(MA_UI_SETTINGS_XID);
        if (settings == null) {
            settings = new JsonDataVO();
            settings.setXid(MA_UI_SETTINGS_XID);
            settings.setName("UI Settings");
            settings.setPublicData(true);
            settings.setReadPermission(MA_UI_DEFAULT_READ_PERMISSION);
            settings.setEditPermission(MA_UI_EDIT_SETTINGS_PERMISSION);
        }

        if (settings.getJsonData() == null) {
            ObjectNode object = nodeFactory.objectNode();
            settings.setJsonData(object);
        }

        JsonDataDao.getInstance().save(settings);
    }
}
