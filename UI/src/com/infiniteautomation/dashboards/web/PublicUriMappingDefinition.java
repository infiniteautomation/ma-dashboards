/**
 * Copyright (C) 2014 Infinite Automation Software. All rights reserved.
 * @author Terry Packer
 */
package com.infiniteautomation.dashboards.web;

import com.infiniteautomation.dashboards.DashboardsCommon;
import com.serotonin.m2m2.db.dao.SystemSettingsDao;
import com.serotonin.m2m2.module.UriMappingDefinition;
import com.serotonin.m2m2.web.mvc.UrlHandler;

/**
 * @author Terry Packer
 *
 */
public class PublicUriMappingDefinition extends UriMappingDefinition{

	/* (non-Javadoc)
	 * @see com.serotonin.m2m2.module.UriMappingDefinition#getPermission()
	 */
	@Override
	public Permission getPermission() {
		return Permission.ANONYMOUS;
	}

	/* (non-Javadoc)
	 * @see com.serotonin.m2m2.module.UriMappingDefinition#getPath()
	 */
	@Override
	public String getPath() {
		return SystemSettingsDao.getValue(DashboardsCommon.DASHBOARDS_PUBLIC_URL_PREFIX, DashboardsCommon.DEFAULT_DASHBOARDS_PUBLIC_URL_PREFIX)  + "/**/*";
	}

	/* (non-Javadoc)
	 * @see com.serotonin.m2m2.module.UriMappingDefinition#getHandler()
	 */
	@Override
	public UrlHandler getHandler() {
		return new DashboardUrlHandler(getModule().getDirectoryPath(), 
				SystemSettingsDao.getValue(DashboardsCommon.DASHBOARDS_PUBLIC_FILES_LOCATION, DashboardsCommon.DEFAULT_DASHBOARDS_PUBLIC_FILES_LOCATION),
				SystemSettingsDao.getValue(DashboardsCommon.DASHBOARDS_PUBLIC_URL_PREFIX, DashboardsCommon.DEFAULT_DASHBOARDS_PUBLIC_URL_PREFIX));
	}

	/* (non-Javadoc)
	 * @see com.serotonin.m2m2.module.UriMappingDefinition#getJspPath()
	 */
	@Override
	public String getJspPath() {
		return null;
	}

}
