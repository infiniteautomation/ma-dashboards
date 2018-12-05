/*
 * Copyright (C) 2018 Infinite Automation Software. All rights reserved.
 */
package com.infiniteautomation.mango.rest.v2;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

import com.infiniteautomation.ui.rest.BootstrapController;

/**
 * @author Jared Wiltshire
 */
@Configuration
@ComponentScan(basePackageClasses = BootstrapController.class)
public class UIConfiguration {

}
