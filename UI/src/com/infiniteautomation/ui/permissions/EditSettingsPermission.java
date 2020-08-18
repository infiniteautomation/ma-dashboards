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
public class EditSettingsPermission extends PermissionDefinition {

    public static final String PERMISSION = "ui.settings.edit";

    @Override
    public TranslatableMessage getDescription() {
        return new TranslatableMessage("permission." + PERMISSION);
    }

    @Override
    public String getPermissionTypeName() {
        return PERMISSION;
    }

    @Override
    public void setPermission(MangoPermission permission) throws ValidationException {
        super.setPermission(permission);
        // TODO Mango 4.0 update JSONDataVO editPermission
    }

}
