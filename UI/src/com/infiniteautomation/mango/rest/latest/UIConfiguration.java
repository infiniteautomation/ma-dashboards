/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */
package com.infiniteautomation.mango.rest.latest;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

/**
 * @author Jared Wiltshire
 */
@Configuration
@ComponentScan(basePackageClasses = BootstrapController.class)
public class UIConfiguration {

}
