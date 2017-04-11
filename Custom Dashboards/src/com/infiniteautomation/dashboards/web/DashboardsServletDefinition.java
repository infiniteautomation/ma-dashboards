/**
 * Copyright (C) 2016 Infinite Automation Software. All rights reserved.
 */
package com.infiniteautomation.dashboards.web;

import javax.servlet.http.HttpServlet;

import com.serotonin.m2m2.module.ServletDefinition;

/**
 * @author Jared Wiltshire
 *
 */
public class DashboardsServletDefinition extends ServletDefinition {
    
    private static final String FORWARD_FROM_PATH = "/dashboards";
    private static final String FORDWARD_TO_PATH = "/modules/dashboards/web/mdAdmin";

    /* (non-Javadoc)
     * @see com.serotonin.m2m2.module.ServletDefinition#getServlet()
     */
    @Override
    public HttpServlet getServlet() {
        return new ForwardingServlet(FORWARD_FROM_PATH, FORDWARD_TO_PATH, "/index.html", false);
    }

    /* (non-Javadoc)
     * @see com.serotonin.m2m2.module.ServletDefinition#getUriPattern()
     */
    @Override
    public String getUriPattern() {
        return FORWARD_FROM_PATH + "/*";
    }

}
