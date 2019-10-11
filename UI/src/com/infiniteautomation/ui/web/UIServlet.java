/**
 * Copyright (C) 2017 Infinite Automation Software. All rights reserved.
 */
package com.infiniteautomation.ui.web;

import java.io.IOException;
import java.net.URL;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.eclipse.jetty.servlet.DefaultServlet;

import com.infiniteautomation.mango.webapp.filters.MangoCacheControlHeaderFilter;
import com.infiniteautomation.mango.webapp.filters.MangoCacheControlHeaderFilter.CacheControlLevel;
import com.serotonin.m2m2.web.mvc.spring.security.BrowserRequestMatcher;

/**
 * @author Jared Wiltshire
 */
public class UIServlet extends DefaultServlet {
    private static final long serialVersionUID = 4078660846403316188L;

    private static final String FORDWARD_TO_PATH = "/modules/mangoUI/web";

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String requestURI = req.getRequestURI();
        String forwardFrom = req.getServletPath();

        if (!requestURI.startsWith(forwardFrom)) {
            getServletContext().getRequestDispatcher(requestURI).forward(req, resp);
            return;
        }

        String relativePath = requestURI.substring(forwardFrom.length());


        URL resourceUrl = getServletContext().getResource(FORDWARD_TO_PATH + relativePath);

        // if the resource is not an actual file we return the index.html file so the webapp can display a 404 not found message
        if (resourceUrl == null) {
            // only redirect to the index.html file if its a browser request
            if (BrowserRequestMatcher.INSTANCE.matches(req)) {
                relativePath = "/";
            } else {
                resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                return;
            }
        }

        if ("/serviceWorker.js".equals(relativePath) || "/".equals(relativePath)) {
            // always re-validate cache for serviceWorker.js and index.html
            req.setAttribute(MangoCacheControlHeaderFilter.CACHE_OVERRIDE_SETTING, CacheControlLevel.DEFAULT);
        }

        getServletContext().getRequestDispatcher(FORDWARD_TO_PATH + relativePath).forward(req, resp);
    }
}
