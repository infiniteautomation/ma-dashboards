/*
 * Copyright (C) 2020 Infinite Automation Software. All rights reserved.
 */
package com.infiniteautomation.ui.permissions;

import com.infiniteautomation.mango.permission.MangoPermission;
import com.infiniteautomation.mango.util.exception.ValidationException;
import com.serotonin.m2m2.i18n.TranslatableMessage;
import com.serotonin.m2m2.module.PermissionDefinition;

/**
 * @author Jared Wiltshire
 */
public class EditMenusPermission extends PermissionDefinition {

    public static final String PERMISSION = "ui.menus.edit";

    @Override
    public TranslatableMessage getDescription() {
        return new TranslatableMessage("permission." + PERMISSION);
    }

    @Override
    public String getPermissionTypeName() {
        return PERMISSION;
    }

    @Override
    public void update(MangoPermission permission) throws ValidationException {
        super.update(permission);
        // TODO update JSONDataVO editPermission
    }

}
