/*
 * Copyright (C) 2019 Infinite Automation Software. All rights reserved.
 */
package com.infiniteautomation.mango.spring;

import java.io.BufferedOutputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

import javax.annotation.PostConstruct;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.stereotype.Service;

import com.serotonin.m2m2.Constants;
import com.serotonin.m2m2.module.AngularJSModuleDefinition;
import com.serotonin.m2m2.module.ModuleRegistry;

/**
 * @author Jared Wiltshire
 */
@Service
public final class CreateModulesService {

    private final Log log = LogFactory.getLog(CreateModulesService.class);

    @PostConstruct
    private void postConstruct() {
        try {
            this.createBundle();
        } catch (IOException e) {
            log.error("Failed to create AngularJS modules bundle", e);
        }
    }

    public void createBundle() throws IOException {
        Path temp = Files.createTempFile("modules_bundle_", ".js");

        try (OutputStream out = new BufferedOutputStream(new FileOutputStream(temp.toFile()))) {
            for (AngularJSModuleDefinition def : ModuleRegistry.getAngularJSDefinitions()) {
                if (def.supportsBundling()) {
                    try {
                        Files.copy(def.getAbsoluteJavaScriptPath(), out);
                    } catch (IOException e) {
                        log.error("Failed to add " + def.getModule().getName() + " to AngularJS modules bundle", e);
                    }
                }
            }
        }

        Path bundle = ModuleRegistry.getModule("mangoUI").modulePath().resolve(Constants.DIR_WEB).resolve("modules_bundle.js");
        try {
            Files.move(temp, bundle, StandardCopyOption.ATOMIC_MOVE);
        } catch (IOException e) {
            Files.move(temp, bundle, StandardCopyOption.REPLACE_EXISTING);
        }
    }
}
