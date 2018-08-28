/**
 * Copyright (C) 2017 Infinite Automation Software. All rights reserved.
 */
package com.infiniteautomation.ui;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.serotonin.m2m2.module.MenuItemDefinition;

/**
 * @author Jared Wiltshire
 *
 */
public class UIMenuItemDefinition extends MenuItemDefinition {
    @Override
    public Visibility getVisibility() {
        return MenuItemDefinition.Visibility.ANONYMOUS;
    }

    @Override
    public String getTextKey(HttpServletRequest request, HttpServletResponse response) {
        return "ui.menuItemText";
    }

    @Override
    public String getHref(HttpServletRequest request, HttpServletResponse response) {
        return "/ui/";
    }

    @Override
    public String getTarget(HttpServletRequest request, HttpServletResponse response) {
        return "mango_v3_ui";
    }

    @Override
    public String getImage(HttpServletRequest request, HttpServletResponse response) {
        return "/web/img/icon16.png";
    }
}
