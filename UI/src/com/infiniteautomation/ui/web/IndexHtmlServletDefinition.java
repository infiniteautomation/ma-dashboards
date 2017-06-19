/**
 * Copyright (C) 2017 Infinite Automation Software. All rights reserved.
 */
package com.infiniteautomation.ui.web;

import java.io.BufferedWriter;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.nio.charset.StandardCharsets;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import com.serotonin.m2m2.Common;
import com.serotonin.m2m2.Constants;
import com.serotonin.m2m2.db.dao.SystemSettingsDao;
import com.serotonin.m2m2.module.ServletDefinition;

import freemarker.template.Configuration;
import freemarker.template.TemplateException;
import freemarker.template.TemplateExceptionHandler;

/**
 * @author Jared Wiltshire
 *
 */
public class IndexHtmlServletDefinition extends ServletDefinition {
    private static final Log LOG = LogFactory.getLog(IndexHtmlServletDefinition.class);

    /* (non-Javadoc)
     * @see com.serotonin.m2m2.module.ServletDefinition#getServlet()
     */
    @Override
    public HttpServlet getServlet() {
        try {
            return new IndexHtmlServlet();
        } catch (IOException e) {
            LOG.error("Error instantiating IndexHtmlServlet()", e);
            return null;
        }
    }

    /* (non-Javadoc)
     * @see com.serotonin.m2m2.module.ServletDefinition#getUriPattern()
     */
    @Override
    public String getUriPattern() {
        return "/modules/mangoUI/web/ui/index.html";
    }

    public final class IndexHtmlServlet extends HttpServlet {
        private static final long serialVersionUID = 1L;
        
        final Configuration config;
        final int lastUpgrade;

        public IndexHtmlServlet() throws IOException {
            File directory = Paths.get(Common.MA_HOME, IndexHtmlServletDefinition.this.getModule().getDirectoryPath(), Constants.DIR_WEB).toFile();

            config = new Configuration(Configuration.DEFAULT_INCOMPATIBLE_IMPROVEMENTS);
            config.setDirectoryForTemplateLoading(directory);
            config.setDefaultEncoding(StandardCharsets.UTF_8.name());
            config.setTemplateExceptionHandler(TemplateExceptionHandler.RETHROW_HANDLER);
            config.setLogTemplateExceptions(false);
            
            lastUpgrade = SystemSettingsDao.getIntValue("lastUpgrade", (int) System.currentTimeMillis() / 1000);
        }

        @Override
        protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
            try {
                resp.setHeader(HttpHeaders.CACHE_CONTROL, "max-age=0, must-revalidate");
                resp.setContentType(MediaType.TEXT_HTML_VALUE);

                Map<String, Object> data = new HashMap<>();
                
                // This will refer to Common.lastUpgrade in 3.2.x series, for now we are getting it from system settings if it exists,
                // if not we just use the current time. This means the cache will be "busted" after every reboot 
                data.put("lastUpgrade", lastUpgrade);
                
                ByteArrayOutputStream bytes = new ByteArrayOutputStream(8192);
                try (Writer writer = new BufferedWriter(new OutputStreamWriter(bytes, StandardCharsets.UTF_8))) {
                    config.getTemplate("ui/index.ftl").process(data, writer);
                    
                    resp.setContentLength(bytes.size());
                    bytes.writeTo(resp.getOutputStream());
                }
                
            } catch (TemplateException e) {
                LOG.error("Freemarker error getting index.html", e);
                throw new ServletException(e);
            }
        }

        @Override
        protected long getLastModified(HttpServletRequest req) {
            return lastUpgrade;
        }
    }
}
