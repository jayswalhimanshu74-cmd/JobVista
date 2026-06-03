package com.Backend.Jobvista.config;

import com.Backend.Jobvista.entity.Role;
import com.Backend.Jobvista.entity.Status;
import com.Backend.Jobvista.entity.User;
import com.Backend.Jobvista.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
@AllArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    @Override
    public void run(String... args) {
        seedAdmin();
    }

    private void seedAdmin() {
        String adminEmail = "admin@jobvista.com";

        if (userRepository.findByEmail(adminEmail).isPresent()) {
            log.info("Admin already exists, skipping seed.");
            return;
        }

        String adminPassword = System.getProperty("ADMIN_PASSWORD", "ChangeMe@1234");

        User admin = User.builder()
                .userId(UUID.randomUUID())
                .name("Admin")
                .email(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .mobileNumber("0000000000")
                .role(Role.ADMIN)
                .status(Status.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        userRepository.save(admin);
        log.info("✅ Admin user created: {}", adminEmail);
    }
}