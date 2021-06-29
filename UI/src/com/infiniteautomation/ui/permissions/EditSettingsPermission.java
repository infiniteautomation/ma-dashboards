/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */
package com.infiniteautomation.ui.permissions;

import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.github.zafarkhaja.semver.Version;
import com.infiniteautomation.mango.permission.MangoPermission;
import com.infiniteautomation.mango.util.exception.ValidationException;
import com.infiniteautomation.ui.UICommon;
import com.serotonin.m2m2.db.dao.JsonDataDao;
import com.serotonin.m2m2.i18n.TranslatableMessage;
import com.serotonin.m2m2.module.PermissionDefinition;
import com.serotonin.m2m2.vo.json.JsonDataVO;
import com.serotonin.m2m2.vo.permission.PermissionHolder;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * @author Jared Wiltshire
 */
public class EditSettingsPermission extends PermissionDefinition {
    public static final String PERMISSION = "ui.settings.edit";

    @Autowired
    JsonDataDao jsonDataDao;

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
        jsonDataDao.doInTransaction(txStatus -> {
            JsonDataVO jsonData = jsonDataDao.getByXid(UICommon.MA_UI_SETTINGS_XID);
            jsonData.setEditPermission(this.permission);
            jsonDataDao.update(jsonData.getId(), jsonData);
        });
    }

    @Override
    public void postEventManager(Version previousVersion, Version current) {
        jsonDataDao.doInTransaction(txStatus -> {
            installSettingsData();
        });
    }

    public void installSettingsData() {
        JsonDataVO jsonData = jsonDataDao.getByXid(UICommon.MA_UI_SETTINGS_XID);
        if (jsonData == null) {
            jsonData = new JsonDataVO();
            jsonData.setXid(UICommon.MA_UI_SETTINGS_XID);
            jsonData.setName("UI Settings");
            jsonData.setReadPermission(MangoPermission.requireAnyRole(PermissionHolder.ANONYMOUS_ROLE, PermissionHolder.USER_ROLE));
        }
        jsonData.setEditPermission(this.permission);

        if (jsonData.getJsonData() == null) {
            JsonNodeFactory nodeFactory = JsonNodeFactory.withExactBigDecimals(false);
            ObjectNode object = nodeFactory.objectNode();
            jsonData.setJsonData(object);
        }

        if (jsonData.getId() > 0) {
            jsonDataDao.update(jsonData.getId(), jsonData);
        } else {
            jsonDataDao.insert(jsonData);
        }
    }

}
