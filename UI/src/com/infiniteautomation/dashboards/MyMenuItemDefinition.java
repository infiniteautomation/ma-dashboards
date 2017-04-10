/**
 * Copyright (C) 2014 Infinite Automation Software. All rights reserved.
 * @author Terry Packer
 */
package com.infiniteautomation.dashboards;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.serotonin.m2m2.Common;
import com.serotonin.m2m2.db.dao.SystemSettingsDao;
import com.serotonin.m2m2.module.MenuItemDefinition;
import com.serotonin.m2m2.vo.permission.Permissions;

/**
 * @author Terry Packer
 *
 */
public class MyMenuItemDefinition extends MenuItemDefinition{

	Log LOG = LogFactory.getLog(MyMenuItemDefinition.class);

	/* (non-Javadoc)
	 * @see com.serotonin.m2m2.module.MenuItemDefinition#getVisibility()
	 */
	@Override
	public Visibility getVisibility() {
		return Visibility.USER;
	}

    @Override
    public boolean isVisible(HttpServletRequest request, HttpServletResponse response) {
    	return Permissions.hasPermission(Common.getUser(request), SystemSettingsDao.getValue(DashboardsPermissionDefinition.PERMISSION));
    }
	
	/* (non-Javadoc)
	 * @see com.serotonin.m2m2.module.MenuItemDefinition#getTextKey(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	public String getTextKey(HttpServletRequest request,
			HttpServletResponse response) {
		return "dashboards.header.icontext";
	}

	/* (non-Javadoc)
	 * @see com.serotonin.m2m2.module.MenuItemDefinition#getImage(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	public String getImage(HttpServletRequest request,
			HttpServletResponse response) {
		return SystemSettingsDao.getValue(DashboardsCommon.DASHBOARDS_ICON_LOCATION, "/web/img/dashboards.png");
	}
	
	/*
	 * (non-Javadoc)
	 * @see com.serotonin.m2m2.module.MenuItemDefinition#getTarget(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
    public String getTarget(HttpServletRequest request, HttpServletResponse response) {
        return "dashboards";
    }
	
    /**
     * The value of the HTML href attribute to use in the menu item. If null, no attribute will be written.
     * 
     * @param request
     *            the current request
     * @param response
     *            the current response
     * @return the href value to use
     */
    public String getHref(HttpServletRequest request, HttpServletResponse response) {
    	return SystemSettingsDao.getValue(DashboardsCommon.DASHBOARDS_ICON_DESTINATION, DashboardsCommon.DEFAULT_DASHBOARDS_ICON_DESTINATION);
    }

	@Override
	public void postDatabase() {
		SystemSettingsDao systemSettingsDao = new SystemSettingsDao();
		if ("/mango-api-docs/index.shtm".equals(SystemSettingsDao.getValue(DashboardsCommon.DASHBOARDS_ICON_DESTINATION))) {
			systemSettingsDao.removeValue(DashboardsCommon.DASHBOARDS_ICON_DESTINATION);
		}
		if (DashboardsCommon.DEFAULT_DASHBOARDS_PUBLIC_URL_PREFIX.equals(SystemSettingsDao.getValue(DashboardsCommon.DASHBOARDS_PUBLIC_URL_PREFIX))) {
			systemSettingsDao.removeValue(DashboardsCommon.DASHBOARDS_PUBLIC_URL_PREFIX);
		}
		if (DashboardsCommon.DEFAULT_DASHBOARDS_PUBLIC_FILES_LOCATION.equals(SystemSettingsDao.getValue(DashboardsCommon.DASHBOARDS_PUBLIC_FILES_LOCATION))) {
			systemSettingsDao.removeValue(DashboardsCommon.DASHBOARDS_PUBLIC_FILES_LOCATION);
		}
		if (DashboardsCommon.DEFAULT_DASHBOARDS_PRIVATE_URL_PREFIX.equals(SystemSettingsDao.getValue(DashboardsCommon.DASHBOARDS_PRIVATE_URL_PREFIX))) {
			systemSettingsDao.removeValue(DashboardsCommon.DASHBOARDS_PRIVATE_URL_PREFIX);
		}
		if (DashboardsCommon.DEFAULT_DASHBOARDS_PRIVATE_FILES_LOCATION.equals(SystemSettingsDao.getValue(DashboardsCommon.DASHBOARDS_PRIVATE_FILES_LOCATION))) {
			systemSettingsDao.removeValue(DashboardsCommon.DASHBOARDS_PRIVATE_FILES_LOCATION);
		}
		if (DashboardsCommon.DEFAULT_DASHBOARDS_ICON_DESTINATION.equals(SystemSettingsDao.getValue(DashboardsCommon.DASHBOARDS_ICON_DESTINATION))) {
			systemSettingsDao.removeValue(DashboardsCommon.DASHBOARDS_ICON_DESTINATION);
		}
		if (DashboardsCommon.DEFAULT_DASHBOARDS_ICON_LOCATION.equals(SystemSettingsDao.getValue(DashboardsCommon.DASHBOARDS_ICON_LOCATION))) {
			systemSettingsDao.removeValue(DashboardsCommon.DASHBOARDS_ICON_LOCATION);
		}
		if (DashboardsCommon.DEFAULT_DASHBOARDS_LOGIN_PAGE.equals(SystemSettingsDao.getValue(DashboardsCommon.DASHBOARDS_LOGIN_PAGE))) {
			systemSettingsDao.removeValue(DashboardsCommon.DASHBOARDS_LOGIN_PAGE);
		}
        if (DashboardsCommon.DEFAULT_DASHBOARDS_FIRST_USER_LOGIN_PAGE.equals(SystemSettingsDao.getValue(DashboardsCommon.DASHBOARDS_FIRST_USER_LOGIN_PAGE))) {
            systemSettingsDao.removeValue(DashboardsCommon.DASHBOARDS_LOGIN_PAGE);
        }
        if (DashboardsCommon.DEFAULT_DASHBOARDS_FIRST_LOGIN_PAGE.equals(SystemSettingsDao.getValue(DashboardsCommon.DASHBOARDS_FIRST_LOGIN_PAGE))) {
            systemSettingsDao.removeValue(DashboardsCommon.DASHBOARDS_LOGIN_PAGE);
        }
        if (DashboardsCommon.DEFAULT_DASHBOARDS_LOGGED_IN_PAGE.equals(SystemSettingsDao.getValue(DashboardsCommon.DASHBOARDS_LOGGED_IN_PAGE))) {
            systemSettingsDao.removeValue(DashboardsCommon.DASHBOARDS_LOGIN_PAGE);
        }
        if (DashboardsCommon.DEFAULT_DASHBOARDS_UNAUTHORIZED_PAGE.equals(SystemSettingsDao.getValue(DashboardsCommon.DASHBOARDS_UNAUTHORIZED_PAGE))) {
            systemSettingsDao.removeValue(DashboardsCommon.DASHBOARDS_LOGIN_PAGE);
        }
	}

}
