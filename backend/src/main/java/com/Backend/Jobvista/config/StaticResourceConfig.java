package com.Backend.Jobvista.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        exposeDirectory("uploads/profiles", registry);
        exposeDirectory("uploads/resumes", registry);
        exposeDirectory("uploads/banners", registry);
    }

    private void exposeDirectory(String dirName, ResourceHandlerRegistry registry) {
        Path uploadDir = Paths.get(dirName).toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadDir);
        } catch (IOException ignored) {}

        String uriString = uploadDir.toUri().toString();
        if (!uriString.endsWith("/")) {
            uriString += "/";
        }

        registry.addResourceHandler("/" + dirName + "/**").addResourceLocations(uriString);
    }
}
