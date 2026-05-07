package com.Backend.Jobvista.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

@Configuration
@EnableAsync
public class AppConfig {
    // This class enables asynchronous processing for the application.
    // Methods annotated with @Async will run in a separate thread pool.
}
