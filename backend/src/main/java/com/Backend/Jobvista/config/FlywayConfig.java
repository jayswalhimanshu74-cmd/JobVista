package com.Backend.Jobvista.config;

import org.flywaydb.core.Flyway;
import org.springframework.boot.LazyInitializationExcludeFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FlywayConfig {

    @Bean
    public LazyInitializationExcludeFilter eagerFlywayMigrationInitializer() {
        return (beanName, beanDefinition, beanType) -> {
            return Flyway.class.isAssignableFrom(beanType) || 
                   (beanType != null && beanType.getName().endsWith("FlywayMigrationInitializer"));
        };
    }
}
