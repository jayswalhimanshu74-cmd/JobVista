package com.Backend.Jobvista;

import org.springframework.boot.SpringApplication;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class JobvistaApplication {

    public static void main(String[] args) {
        if (System.getenv("RENDER") == null) {
            String directory = ".";
            if (!new java.io.File(".env").exists()
                    && new java.io.File("../.env").exists()) {
                directory = "..";
            }
            Dotenv dotenv = Dotenv.configure()
                    .directory(directory)
                    .ignoreIfMissing()
                    .load();

            dotenv.entries().forEach(entry -> {
                if (System.getProperty(entry.getKey()) == null) {
                    System.setProperty(entry.getKey(), entry.getValue());
                }
            });
        }

        SpringApplication.run(JobvistaApplication.class, args);
    }

}
