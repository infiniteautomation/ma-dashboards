/**
 * Copyright (C) 2015 Infinite Automation Software. All rights reserved.
 * @author Terry Packer
 */
package com.infiniteautomation.dashboards.web;

import javax.servlet.http.HttpServlet;

import com.serotonin.m2m2.module.ServletDefinition;

/**
 * Class to serve up the Api Documentation from /mango-api-docs/
 * 
 * @author Terry Packer
 *
 */
public class MangoApiDocsServletDefinition extends ServletDefinition{

	/**
	 * The base url to use as a reference, this mapping is in the Spring Dispatch Servlet so it
	 * will ensure that this Handler is Used for anything starting with /mango-docs/*
	 */
	private static final String baseUrl = "/mango-api-docs/";


	/* (non-Javadoc)
	 * @see com.serotonin.m2m2.module.ServletDefinition#getUriPattern()
	 */
	@Override
	public String getUriPattern() {
		return "/mango-api-docs/*";
	}
	
	/* (non-Javadoc)
	 * @see com.serotonin.m2m2.module.ServletDefinition#getServlet()
	 */
	@Override
	public HttpServlet getServlet() {
		return new ResourceServlet(baseUrl, getModule().getDirectoryPath() + "/web/private/api-docs/");
	}
}
