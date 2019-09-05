/**
 * Copyright (C) 2017 Infinite Automation Software. All rights reserved.
 */
package com.infiniteautomation.ui.web;

import java.io.IOException;
import java.net.URL;
import java.util.Objects;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.eclipse.jetty.servlet.DefaultServlet;
import org.springframework.http.HttpHeaders;
import org.springframework.web.filter.ShallowEtagHeaderFilter;

import com.serotonin.m2m2.Common;
import com.serotonin.m2m2.web.filter.MangoShallowEtagHeaderFilter;
import com.serotonin.m2m2.web.mvc.spring.security.BrowserRequestMatcher;

/**
 * @author Jared Wiltshire
 */
public class UIServlet extends DefaultServlet {
    private static final long serialVersionUID = 4078660846403316188L;

    private final String forwardFrom;
    private final String forwardTo;
    private final String defaultPath;
    private final String defaultHeaderValue = String.format(MangoShallowEtagHeaderFilter.MAX_AGE_TEMPLATE, Common.envProps.getLong("web.cache.maxAge", 0L));
    // use the versioned resource setting as we are assuming everything loaded from /ui is versioned
    private final String resourceHeaderValue = String.format(MangoShallowEtagHeaderFilter.MAX_AGE_TEMPLATE, Common.envProps.getLong("web.cache.maxAge.versionedResources", 31536000L));

    public UIServlet(String forwardFrom, String forwardTo, String defaultPath) {
        this.forwardFrom = Objects.requireNonNull(forwardFrom);
        this.forwardTo = Objects.requireNonNull(forwardTo);
        this.defaultPath = Objects.requireNonNull(defaultPath);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String requestURI = req.getRequestURI();

        if (!requestURI.startsWith(forwardFrom)) {
            getServletContext().getRequestDispatcher(requestURI).forward(req, resp);
            return;
        }

        String relativePath = requestURI.substring(forwardFrom.length());

        // Jetty handles forwarding / to /index.html
        URL resourceUrl = getServletContext().getResource(forwardTo + relativePath);

        // if the resource is not a real file inside forwardFrom
        if (resourceUrl == null) {
            if (BrowserRequestMatcher.INSTANCE.matches(req)) {
                relativePath = defaultPath;
            } else {
                resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                return;
            }
        }

        String cacheControlHeader;
        if ("/serviceWorker.js".equals(relativePath) || defaultPath.equals(relativePath) || "/".equals(relativePath)) {
            // always re-validate cache for serviceWorker.js and index.html
            cacheControlHeader = defaultHeaderValue;
        } else {
            // treat any other file as a versioned resource
            cacheControlHeader = resourceHeaderValue;
        }

        // Disable the Etag header and rely on last modified time only
        ShallowEtagHeaderFilter.disableContentCaching(req);
        // Override the Cache-Control header that was set by the EtagHeaderFilter
        resp.setHeader(HttpHeaders.CACHE_CONTROL, cacheControlHeader);

        getServletContext().getRequestDispatcher(forwardTo + relativePath).forward(req, resp);
    }
}
