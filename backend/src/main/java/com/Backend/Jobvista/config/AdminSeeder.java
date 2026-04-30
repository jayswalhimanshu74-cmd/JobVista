package com.Backend.Jobvista.config;

import com.Backend.Jobvista.entity.Role;
import com.Backend.Jobvista.entity.Status;
import com.Backend.Jobvista.entity.User;
import com.Backend.Jobvista.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Seeds a default ADMIN user on application startup if one does not already
 * exist.
 * This is necessary because the registration endpoint blocks ADMIN role
 * signups.
 */
@Component
@AllArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String adminEmail = "admin@jobvista.com";

        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            User admin = User.builder()
                    .userId(UUID.randomUUID())
                    .name("Admin")
                    .email(adminEmail)
                    .password(passwordEncoder.encode("admin123"))
                    .mobileNumber("0000000000")
                    .role(Role.ADMIN)
                    .status(Status.ACTIVE)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            userRepository.save(admin);
            System.out.println("✅ Default ADMIN user created: " + adminEmail);
        } else {
            System.out.println("ℹ️ ADMIN user already exists: " + adminEmail);
        }
    }
}
