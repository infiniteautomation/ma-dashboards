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

/**
 * @author Jared Wiltshire
 */
public class ForwardingServlet extends DefaultServlet {
    private static final long serialVersionUID = -8475157239062257417L;
    
    private final String forwardFrom;
    private final String forwardTo;
    private final String notFoundPath;
    private final boolean notFoundInSubdir;
    
    /**
     * @param forwardFrom Path which is being forwarded from, starts with a slash, no slash on end, e.g. /ui
     * @param forwardTo Path which is being forwarded to, starts with a slash, no slash on end, e.g. /modules/mangoUI/web
     * @param notFoundPath If the path we are forwarding to is not found, forward to the forwardTo path with this as a suffix, e.g. /index.html
     * @param notFoundInSubdir If the path we are forwarding to is not found and the request path is for a subdirectory, forward to the subdirectory
     * followed by the notFoundPath
     */
    public ForwardingServlet(String forwardFrom, String forwardTo, String notFoundPath, boolean notFoundInSubdir) {
        this.forwardFrom = forwardFrom;
        this.forwardTo = forwardTo;
        this.notFoundPath = notFoundPath;
        this.notFoundInSubdir = notFoundInSubdir;
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        if (!req.getRequestURI().startsWith(forwardFrom)) {
            getServletContext().getRequestDispatcher(req.getRequestURI()).forward(req, resp);
            return;
        }
        
        String relativePath = req.getRequestURI().substring(forwardFrom.length());
        String redirectUri = forwardTo + relativePath;
        
        if (notFoundPath != null) {
            URL resourceUrl = getServletContext().getResource(redirectUri);
            if (resourceUrl == null) {
                int nextSlash;
                if (notFoundInSubdir && (nextSlash = relativePath.indexOf("/", 1)) >= 0) {
                    redirectUri = forwardTo + relativePath.substring(0, nextSlash) + notFoundPath;
                } else {
                    redirectUri = forwardTo + notFoundPath;
                }
            }
        }

        getServletContext().getRequestDispatcher(redirectUri).forward(req, resp);
    }
}
