/**
 * Copyright (C) 2017 Infinite Automation Software. All rights reserved.
 */
package com.infiniteautomation.ui.web;

import javax.servlet.http.HttpServlet;

import com.serotonin.m2m2.module.ServletDefinition;

/**
 * @author Jared Wiltshire
 *
 */
public class UIServletDefinition extends ServletDefinition {
    
    private static final String FORWARD_FROM_PATH = "/ui";
    private static final String FORDWARD_TO_PATH = "/modules/mangoUI/web/ui";

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
